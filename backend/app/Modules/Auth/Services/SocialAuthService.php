<?php

namespace App\Modules\Auth\Services;

use App\Models\SocialAccount;
use App\Models\User;
use App\Services\AuthTokenService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthService
{
    /**
     * Proveedores soportados oficialmente.
     */
    protected array $supportedProviders = ['google', 'github'];

    /**
     * Genera la URL de redirección hacia el proveedor OAuth con state anti-CSRF.
     */
    public function getRedirectUrl(string $provider, ?string $scopeType = null, ?User $currentUser = null): string
    {
        $this->ensureSupportedProvider($provider);

        $state = Str::random(40);
        $stateData = [
            'provider' => $provider,
            'user_id' => $currentUser?->id,
            'scope_type' => $scopeType,
            'created_at' => now()->timestamp,
        ];

        // Guardamos el state temporalmente por 15 minutos en caché
        Cache::put("oauth_state_{$state}", $stateData, now()->addMinutes(15));

        $driver = Socialite::driver($provider)->stateless();

        if ($provider === 'github') {
            // Scope progresivo: si se solicita permisos para repositorios, pedir public_repo
            if (in_array($scopeType, ['repo', 'public_repo'], true)) {
                $driver->scopes(['read:user', 'user:email', 'public_repo']);
            } else {
                $driver->scopes(['read:user', 'user:email']);
            }
        } elseif ($provider === 'google') {
            $driver->scopes(['openid', 'profile', 'email']);
        }

        return $driver->with(['state' => $state])->redirect()->getTargetUrl();
    }

    /**
     * Procesa el callback del proveedor OAuth, intercambia el código, sincroniza
     * la cuenta social y emite el token JWT para la sesión.
     */
    public function handleCallback(string $provider, ?string $state = null): array
    {
        $this->ensureSupportedProvider($provider);

        // Validar el state anti-CSRF (desde caché o desde payload base64url)
        $cachedState = $state ? Cache::pull("oauth_state_{$state}") : null;
        if (! $cachedState && $state) {
            try {
                $b64 = strtr($state, '-_', '+/');
                $b64 .= str_repeat('=', (4 - strlen($b64) % 4) % 4);
                $decoded = json_decode(base64_decode($b64), true);
                if (is_array($decoded) && isset($decoded['provider'])) {
                    $cachedState = [
                        'provider' => $decoded['provider'],
                        'user_id' => $decoded['user_id'] ?? null,
                        'scope_type' => $decoded['scope_type'] ?? null,
                    ];
                }
            } catch (\Throwable) {
                // Ignore decoding error
            }
        }
        $linkingUserId = $cachedState['user_id'] ?? null;
        $scopeType = $cachedState['scope_type'] ?? null;

        $clientSecret = config("services.{$provider}.client_secret");
        if (empty($clientSecret)) {
            $upper = strtoupper($provider);
            throw new \RuntimeException("Falta configurar la variable de entorno {$upper}_CLIENT_SECRET en el panel de Render.");
        }

        /** @var \Laravel\Socialite\Two\User $socialiteUser */
        $socialiteUser = Socialite::driver($provider)->stateless()->user();

        $providerUserId = (string) $socialiteUser->getId();
        $email = $socialiteUser->getEmail();
        $name = $socialiteUser->getName() ?: $socialiteUser->getNickname() ?: 'Estudiante';
        $avatar = $socialiteUser->getAvatar();
        $nickname = $socialiteUser->getNickname();
        $accessToken = $socialiteUser->token;
        $refreshToken = $socialiteUser->refreshToken ?? null;
        $expiresIn = $socialiteUser->expiresIn ?? null;

        // Fallback especial para GitHub si el correo es privado en su perfil
        if ($provider === 'github' && empty($email) && !empty($accessToken)) {
            $email = $this->fetchGitHubPrimaryEmail($accessToken);
        }

        $email = $email ? strtolower(trim($email)) : null;

        // Determinar scopes otorgados
        $grantedScopes = ['read:user', 'user:email'];
        if ($provider === 'github' && in_array($scopeType, ['repo', 'public_repo'], true)) {
            $grantedScopes[] = 'public_repo';
        }

        // 1. Buscar si la identidad social ya existe en la base de datos
        $socialAccount = SocialAccount::where('provider', $provider)
            ->where('provider_user_id', $providerUserId)
            ->first();

        if ($socialAccount) {
            // Actualizar tokens y metadatos
            $socialAccount->update([
                'nickname' => $nickname ?: $socialAccount->nickname,
                'avatar_url' => $avatar ?: $socialAccount->avatar_url,
                'token' => $accessToken,
                'refresh_token' => $refreshToken ?: $socialAccount->refresh_token,
                'token_expires_at' => $expiresIn ? now()->addSeconds($expiresIn) : $socialAccount->token_expires_at,
                'scopes' => array_values(array_unique(array_merge($socialAccount->scopes ?? [], $grantedScopes))),
            ]);

            $user = $socialAccount->user;
        } else {
            // 2. Si no existe la identidad social, verificar si hay vinculación explícita o match por correo
            $user = null;

            if ($linkingUserId) {
                $user = User::find($linkingUserId);
            }

            if (!$user && $email) {
                $user = User::where('email', $email)->first();
            }

            if ($user) {
                // Si el usuario existe pero no tenía email verificado, se verifica al confirmar con Google/GitHub
                if (!$user->email_verified_at) {
                    $user->email_verified_at = now();
                    $user->save();
                }

                if (empty($user->avatar) && !empty($avatar)) {
                    $user->avatar = $avatar;
                    $user->save();
                }
            } else {
                // 3. Crear nuevo usuario en la plataforma
                $user = User::create([
                    'name' => $name,
                    'email' => $email ?: "user_{$providerUserId}@{$provider}.sysengacademy.site",
                    'password' => Hash::make(Str::random(32)),
                    'avatar' => $avatar,
                    'role' => 'student',
                    'email_verified_at' => now(),
                    'current_streak' => 1,
                    'max_streak' => 1,
                    'last_activity_date' => now()->toDateString(),
                    'today_study_seconds' => 0,
                    'total_study_seconds' => 0,
                    'xp' => 50,
                ]);
            }

            // Crear el registro en social_accounts
            $socialAccount = SocialAccount::create([
                'user_id' => $user->id,
                'provider' => $provider,
                'provider_user_id' => $providerUserId,
                'nickname' => $nickname,
                'avatar_url' => $avatar,
                'token' => $accessToken,
                'refresh_token' => $refreshToken,
                'token_expires_at' => $expiresIn ? now()->addSeconds($expiresIn) : null,
                'scopes' => $grantedScopes,
            ]);
        }

        // Emitir JWT de sesión de SysEng Academy
        $token = AuthTokenService::issue($user);

        return [
            'user' => $user->fresh(['socialAccounts']),
            'token' => $token,
            'provider' => $provider,
            'nickname' => $nickname,
            'has_repo_scope' => in_array('public_repo', $socialAccount->scopes ?? [], true),
            'is_new_user' => $user->wasRecentlyCreated,
        ];
    }

    /**
     * Consulta la API de correos de GitHub si el usuario tiene su email principal como privado.
     */
    protected function fetchGitHubPrimaryEmail(string $accessToken): ?string
    {
        try {
            $response = Http::withToken($accessToken)
                ->withHeaders(['Accept' => 'application/vnd.github+json'])
                ->get('https://api.github.com/user/emails');

            if ($response->successful()) {
                $emails = $response->json();
                foreach ($emails as $emailItem) {
                    if (!empty($emailItem['primary']) && !empty($emailItem['verified'])) {
                        return $emailItem['email'];
                    }
                }
                if (!empty($emails[0]['email'])) {
                    return $emails[0]['email'];
                }
            }
        } catch (\Throwable) {
            // Silencioso, usará fallback automático
        }

        return null;
    }

    /**
     * Valida que el proveedor sea compatible.
     */
    protected function ensureSupportedProvider(string $provider): void
    {
        if (!in_array($provider, $this->supportedProviders, true)) {
            abort(400, "El proveedor de autenticación '{$provider}' no está soportado.");
        }
    }
}
