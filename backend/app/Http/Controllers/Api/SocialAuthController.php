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
     * Endpoint API para intercambio directo de código OAuth (llamado desde el frontend SPA en Vercel).
     */
    public function exchange(Request $request, string $provider): JsonResponse
    {
        $code = (string) $request->input('code');
        $state = (string) $request->input('state');
        $redirectUri = (string) $request->input('redirect_uri');

        if (empty($code)) {
            return response()->json([
                'success' => false,
                'message' => 'El código de autorización OAuth es obligatorio.',
            ], 422);
        }

        try {
            $result = $this->socialAuthService->handleCallback($provider, $state, $redirectUri ?: null);

            return response()->json([
                'success' => true,
                'token' => $result['token'],
                'user' => $result['user'],
                'has_repo_scope' => $result['has_repo_scope'] ?? false,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'No se pudo verificar la autorización con el proveedor.',
            ], 400);
        }
    }

    /**
     * Procesa el retorno del proveedor OAuth y despacha los datos al frontend.
     */
    public function callback(Request $request, string $provider): Response|JsonResponse
    {
        if ($request->wantsJson() || $request->isJson() || $request->has('exchange')) {
            return $this->exchange($request, $provider);
        }

        $frontendUrl = rtrim(config('app.frontend_url') ?: env('FRONTEND_URL', 'https://www.sysengacademy.site'), '/');
        $state = (string) $request->query('state', $request->input('state', ''));
        $redirectUri = (string) $request->input('redirect_uri', '');

        try {
            $result = $this->socialAuthService->handleCallback($provider, $state, $redirectUri ?: null);

            $payloadJson = json_encode([
                'type' => 'SYSENG_OAUTH_SUCCESS',
                'provider' => $provider,
                'token' => $result['token'],
                'user' => $result['user'],
                'has_repo_scope' => $result['has_repo_scope'] ?? false,
            ]);

            $redirectUrl = "{$frontendUrl}/?token=" . urlencode($result['token']) . "&provider={$provider}";

            // Despacho transparente sin interfaz intermedia visible (0ms delay)
            $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>SysEng Academy</title>
</head>
<body style="background:#08090d;margin:0;">
    <script>
        (function() {
            var payload = {$payloadJson};
            var redirectUrl = "{$redirectUrl}";

            if (window.opener && !window.opener.closed) {
                try {
                    window.opener.postMessage(payload, "*");
                } catch(e) {}
                window.close();
            } else {
                window.location.replace(redirectUrl);
            }
        })();
    </script>
</body>
</html>
HTML;

            return response($html, 200, ['Content-Type' => 'text/html']);
        } catch (\Throwable $e) {
            $errorMessage = $e->getMessage() ?: 'No se pudo completar la autenticación.';
            $errorJson = json_encode([
                'type' => 'SYSENG_OAUTH_ERROR',
                'provider' => $provider,
                'message' => $errorMessage,
            ]);
            $loginErrorUrl = "{$frontendUrl}/auth/login?error=" . urlencode($errorMessage);

            $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Error de Autenticación</title>
</head>
<body style="background:#08090d;margin:0;">
    <script>
        (function() {
            var errorData = {$errorJson};
            var loginErrorUrl = "{$loginErrorUrl}";

            if (window.opener && !window.opener.closed) {
                try {
                    window.opener.postMessage(errorData, "*");
                } catch(e) {}
                window.close();
            } else {
                window.location.replace(loginErrorUrl);
            }
        })();
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
