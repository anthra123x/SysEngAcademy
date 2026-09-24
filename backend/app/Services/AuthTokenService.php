<?php

namespace App\Services;

use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * Emisión y revocación de JWTs stateless para la API.
 */
class AuthTokenService
{
    public static function issue(User $user): string
    {
        $now = time();

        $payload = [
            'iss' => config('app.url'),
            'sub' => $user->id,
            'role' => $user->role,
            'name' => $user->name,
            'email' => $user->email,
            'iat' => $now,
            'exp' => $now + config('auth.jwt_ttl', 10080) * 60,
            'jti' => (string) Str::uuid(),
        ];

        return JWT::encode($payload, self::secret(), 'HS256');
    }

    /**
     * Invalida un JWT de forma inmediata (lo mete en la blacklist hasta su exp).
     */
    public static function blacklist(string $token): void
    {
        try {
            $payload = JWT::decode($token, new Key(self::secret(), 'HS256'));

            $remaining = $payload->exp - time();

            if ($remaining > 0) {
                Cache::put("jwt.blacklist.{$payload->jti}", true, $remaining);
            }
        } catch (\Throwable) {
            // Token inválido o expirado: nada que bloquear.
        }
    }

    protected static function secret(): string
    {
        return config('auth.jwt_secret') ?: (string) config('app.key');
    }
}
