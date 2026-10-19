<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Services\SocialAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SocialAuthController extends Controller
{
    public function __construct(
        protected SocialAuthService $socialAuthService
    ) {}

    /**
     * Redirige hacia el proveedor OAuth o retorna la URL para popups en el frontend.
     */
    public function redirect(Request $request, string $provider): JsonResponse|\Illuminate\Http\RedirectResponse
    {
        $scopeType = $request->query('scope_type'); // 'public_repo', 'repo', o null
        $user = $request->user();

        $targetUrl = $this->socialAuthService->getRedirectUrl($provider, $scopeType, $user);

        if ($request->wantsJson() || $request->query('json') === 'true') {
            return response()->json([
                'provider' => $provider,
                'url' => $targetUrl,
            ]);
        }

        return redirect()->away($targetUrl);
    }

    /**
     * Procesa el retorno del proveedor OAuth y despacha los datos al frontend.
     */
    public function callback(Request $request, string $provider): Response
    {
        $frontendUrl = rtrim(config('app.frontend_url') ?: env('FRONTEND_URL', 'https://www.sysengacademy.site'), '/');
        $state = (string) $request->query('state', '');

        try {
            $result = $this->socialAuthService->handleCallback($provider, $state);

            $payloadJson = json_encode([
                'type' => 'SYSENG_OAUTH_SUCCESS',
                'provider' => $provider,
                'token' => $result['token'],
                'user' => $result['user'],
                'has_repo_scope' => $result['has_repo_scope'] ?? false,
            ]);

            $redirectUrl = "{$frontendUrl}/auth/callback?token=" . urlencode($result['token']) . "&provider={$provider}";

            // Página HTML puente: comunica vía window.opener.postMessage (si es popup)
            // o redirige automáticamente a la URL del frontend (si fue redirección directa).
            $html = <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>SysEng Academy - Autenticación</title>
    <style>
        body {
            background-color: #08090d;
            color: #f1f5f9;
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
        }
        .card {
            background: #11121d;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            padding: 32px 40px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }
        .spinner {
            width: 36px;
            height: 36px;
            border: 3px solid rgba(168, 85, 247, 0.2);
            border-top-color: #a855f7;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 16px auto;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="card">
        <div class="spinner"></div>
        <p>Autenticando con {$provider} en SysEng Academy...</p>
    </div>
    <script>
        const payload = {$payloadJson};
        const redirectUrl = "{$redirectUrl}";

        if (window.opener && !window.opener.closed) {
            window.opener.postMessage(payload, "*");
            setTimeout(() => window.close(), 300);
        } else {
            window.location.replace(redirectUrl);
        }
    </script>
</body>
</html>
HTML;

            return response($html, 200, ['Content-Type' => 'text/html']);
        } catch (\Throwable $e) {
            $errorMessage = $e->getMessage();
            $errorJson = json_encode([
                'type' => 'SYSENG_OAUTH_ERROR',
                'provider' => $provider,
                'message' => $errorMessage,
            ]);

            $html = <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Error de Autenticación</title>
    <style>
        body { background: #08090d; color: #f87171; font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; }
        .card { background: #11121d; border: 1px solid #f8717140; border-radius: 12px; padding: 24px; text-align: center; }
    </style>
</head>
<body>
    <div class="card">
        <h3>No se pudo completar la autenticación</h3>
        <p>{$errorMessage}</p>
    </div>
    <script>
        const errorData = {$errorJson};
        if (window.opener && !window.opener.closed) {
            window.opener.postMessage(errorData, "*");
            setTimeout(() => window.close(), 1500);
        } else {
            setTimeout(() => window.location.replace("{$frontendUrl}/auth/login?error=" + encodeURIComponent(errorData.message)), 1500);
        }
    </script>
</body>
</html>
HTML;
            return response($html, 400, ['Content-Type' => 'text/html']);
        }
    }

    /**
     * Consulta el estado de las cuentas vinculadas del usuario actual.
     */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();
        $accounts = $user->socialAccounts;

        $github = $accounts->firstWhere('provider', 'github');
        $google = $accounts->firstWhere('provider', 'google');

        $githubSyncsCount = $user->appNotifications()->where('type', 'github_sync')->count();
        $recentSyncs = $user->appNotifications()
            ->where('type', 'github_sync')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($n) => [
                'title'      => $n->title,
                'created_at' => $n->created_at?->diffForHumans(),
                'repo_url'   => $n->data['repo_url'] ?? null,
                'commit_url' => $n->data['commit_url'] ?? null,
                'file_url'   => $n->data['file_url'] ?? null,
                'repo_name'  => $n->data['repo_name'] ?? null,
            ]);

        return response()->json([
            'google' => [
                'connected' => $google !== null,
                'nickname' => $google?->nickname,
                'avatar_url' => $google?->avatar_url,
            ],
            'github' => [
                'connected' => $github !== null,
                'nickname' => $github?->nickname,
                'avatar_url' => $github?->avatar_url,
                'has_repo_scope' => in_array('public_repo', $github?->scopes ?? [], true) || in_array('repo', $github?->scopes ?? [], true),
                'syncs_count' => $githubSyncsCount,
                'xp_earned' => $githubSyncsCount * 25,
                'recent_syncs' => $recentSyncs,
            ],
        ]);
    }

    /**
     * Desvincula un proveedor social.
     */
    public function disconnect(Request $request, string $provider): JsonResponse
    {
        $user = $request->user();

        // Validar que el usuario no se quede sin acceso si no tiene contraseña ni otro proveedor
        $remainingSocials = $user->socialAccounts()->where('provider', '!=', $provider)->count();
        $hasPassword = !empty($user->password);

        if ($remainingSocials === 0 && !$hasPassword) {
            return response()->json([
                'message' => 'No puedes desvincular este método de acceso sin antes haber configurado una contraseña o vinculado otra cuenta.',
            ], 422);
        }

        $user->socialAccounts()->where('provider', $provider)->delete();

        return response()->json([
            'success' => true,
            'message' => "La cuenta de {$provider} ha sido desvinculada exitosamente.",
        ]);
    }
}
