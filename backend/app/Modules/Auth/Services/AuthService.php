<?php

namespace App\Modules\Auth\Services;

use App\Models\User;
use App\Modules\Auth\DTOs\LoginDTO;
use App\Modules\Auth\DTOs\RegisterDTO;
use App\Services\AuthTokenService;
use App\Services\TransactionalMailService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Inicia el registro de un nuevo usuario generando y enviando un código de activación por correo.
     * Los datos quedan en caché segura hasta que el usuario confirme el código recibido en su buzón.
     */
    public function requestRegistrationCode(RegisterDTO $dto): array
    {
        $cleanEmail = strtolower(trim($dto->email));

        if (User::where('email', $cleanEmail)->exists()) {
            throw ValidationException::withMessages([
                'email' => ['Este correo electrónico ya se encuentra registrado. ¿Deseas iniciar sesión?'],
            ]);
        }

        $verifyCode = sprintf('%06d', mt_rand(100000, 999999));

        // Guardamos los datos de registro pendientes en caché por 30 minutos
        Cache::put("pending_registration_{$cleanEmail}", [
            'name'     => trim($dto->name),
            'email'    => $cleanEmail,
            'password' => Hash::make($dto->password),
            'role'     => $dto->role ?? 'student',
        ], now()->addMinutes(30));

        Cache::put("email_verify_code_{$cleanEmail}", $verifyCode, now()->addMinutes(30));

        $verifyUrl = rtrim(config('app.frontend_url', 'https://www.sysengacademy.site'), '/')
            . '/auth/verificar?email=' . urlencode($cleanEmail)
            . '&code=' . urlencode($verifyCode);

        // Envío obligatorio mediante Resend REST API a la bandeja de entrada
        TransactionalMailService::send(
            toEmail: $cleanEmail,
            subject: "¡Bienvenido a SysEng Academy! Tu código de activación: {$verifyCode}",
            view: 'emails.verify-code',
            viewData: [
                'userName'   => $dto->name,
                'verifyCode' => $verifyCode,
                'userEmail'  => $cleanEmail,
                'verifyUrl'  => $verifyUrl,
                'actionText' => 'Verificar y Acceder a mi Perfil →',
            ]
        );

        return [
            'success'               => true,
            'requires_verification' => true,
            'email'                 => $cleanEmail,
            'message'               => 'Hemos enviado un código de activación de 6 dígitos a tu correo electrónico. Ingrésalo a continuación para crear tu cuenta.',
        ];
    }

    /**
     * Confirma el código de activación e inserta el usuario en base de datos.
     */
    public function confirmRegistration(string $email, string $code): array
    {
        $cleanEmail = strtolower(trim($email));
        $trimmedCode = trim($code);

        $expectedCode = Cache::get("email_verify_code_{$cleanEmail}");

        if (!$expectedCode || !hash_equals((string) $expectedCode, (string) $trimmedCode)) {
            abort(422, 'El código de activación es inválido o ha expirado. Por favor verifica tu bandeja de entrada o solicita uno nuevo.');
        }

        $pending = Cache::get("pending_registration_{$cleanEmail}");

        if ($pending) {
            try {
                $user = User::create([
                    'name'                => $pending['name'],
                    'email'               => $cleanEmail,
                    'password'            => $pending['password'],
                    'role'                => $pending['role'] ?? 'student',
                    'email_verified_at'   => now(),
                    'current_streak'      => 1,
                    'max_streak'          => 1,
                    'last_activity_date'  => now()->toDateString(),
                    'today_study_seconds' => 0,
                    'total_study_seconds' => 0,
                    'xp'                  => 50,
                ]);
            } catch (\Illuminate\Database\UniqueConstraintViolationException|\Illuminate\Database\QueryException $e) {
                $user = User::where('email', $cleanEmail)->firstOrFail();
                $user->email_verified_at = now();
                $user->save();
            }

            Cache::forget("pending_registration_{$cleanEmail}");
        } else {
            $user = User::where('email', $cleanEmail)->first();
            if (!$user) {
                abort(422, 'La sesión de registro ha expirado. Por favor ingresa tus datos nuevamente.');
            }
            $user->email_verified_at = now();
            $user->save();
        }

        Cache::forget("email_verify_code_{$cleanEmail}");
        if (isset($user)) {
            Cache::forget("email_verify_code_{$user->id}");
        }

        $token = AuthTokenService::issue($user);

        return [
            'user'                  => $user,
            'token'                 => $token,
            'verification_required' => false,
            'message'               => '¡Cuenta verificada y creada exitosamente! Bienvenido a SysEng Academy.',
        ];
    }

    /**
     * Reenvía un nuevo código de activación para un registro pendiente o usuario existente.
     */
    public function resendRegistrationCode(string $email): array
    {
        $cleanEmail = strtolower(trim($email));
        $pending = Cache::get("pending_registration_{$cleanEmail}");
        $user = User::where('email', $cleanEmail)->first();

        if (!$pending && !$user) {
            abort(404, 'No se encontró ninguna solicitud de registro pendiente para este correo electrónico.');
        }

        $userName = $pending['name'] ?? ($user ? $user->name : 'Estudiante');
        $verifyCode = sprintf('%06d', mt_rand(100000, 999999));

        Cache::put("email_verify_code_{$cleanEmail}", $verifyCode, now()->addMinutes(30));
        if ($user) {
            Cache::put("email_verify_code_{$user->id}", $verifyCode, now()->addMinutes(30));
        }

        $verifyUrl = rtrim(config('app.frontend_url', 'https://www.sysengacademy.site'), '/')
            . '/auth/verificar?email=' . urlencode($cleanEmail)
            . '&code=' . urlencode($verifyCode);

        TransactionalMailService::send(
            toEmail: $cleanEmail,
            subject: "Nuevo Código de Activación: {$verifyCode} - SysEng Academy",
            view: 'emails.verify-code',
            viewData: [
                'userName'   => $userName,
                'verifyCode' => $verifyCode,
                'userEmail'  => $cleanEmail,
                'verifyUrl'  => $verifyUrl,
                'actionText' => 'Verificar y Acceder a mi Perfil →',
            ]
        );

        return [
            'success' => true,
            'message' => 'Hemos reenviado un nuevo código de activación a tu correo electrónico. Por favor revisa tu bandeja de entrada o spam.',
        ];
    }

    /**
     * Registra un nuevo usuario en la plataforma (punto de entrada general).
     */
    public function register(RegisterDTO $dto): array
    {
        return $this->requestRegistrationCode($dto);
    }

    /**
     * Autentica un usuario con credenciales y emite token de sesión.
     */
    public function login(LoginDTO $dto): array
    {
        $cleanEmail = strtolower(trim($dto->email));
        $user = User::where('email', $cleanEmail)->first();

        $isMatch = $user && $this->verifyUserPassword($dto->password, $user);

        if (!$user || !$isMatch) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales no son correctas.'],
            ]);
        }

        // Si por alguna razón histórica no tiene email_verified_at, activarlo al iniciar sesión
        if (!$user->email_verified_at) {
            $user->email_verified_at = now();
            $user->save();
        }

        $token = AuthTokenService::issue($user);

        return [
            'user'  => $user,
            'token' => $token,
        ];
    }

    /**
     * Valida el código de verificación de correo.
     */
    public function verifyEmail(string $code, ?string $email = null, ?User $user = null): array
    {
        if (!$user && $email) {
            $user = User::where('email', strtolower(trim($email)))->first();
        }

        $cleanEmail = $user ? $user->email : strtolower(trim((string)$email));

        $expectedCode = ($user ? Cache::get("email_verify_code_{$user->id}") : null)
            ?? Cache::get("email_verify_code_{$cleanEmail}");

        $trimmedCode = trim($code);

        if ($expectedCode && hash_equals((string) $expectedCode, (string) $trimmedCode)) {
            if ($user) {
                $user->email_verified_at = now();
                $user->save();
                Cache::forget("email_verify_code_{$user->id}");
            }
            Cache::forget("email_verify_code_{$cleanEmail}");

            return [
                'message' => '¡Correo electrónico verificado exitosamente!',
                'user'    => $user,
            ];
        }

        abort(422, 'El código de verificación es inválido o ha expirado.');
    }

    /**
     * Reenvía el código de confirmación.
     */
    public function resendVerification(?string $email = null, ?User $user = null): array
    {
        $targetEmail = $user ? $user->email : strtolower(trim((string)$email));
        return $this->resendRegistrationCode($targetEmail);
    }

    /**
     * Cierra la sesión invalidando el token JWT.
     */
    public function logout(): array
    {
        if ($jwt = Auth::guard('jwt')->token()) {
            AuthTokenService::blacklist($jwt);
        }

        return ['message' => 'Sesión cerrada correctamente.'];
    }

    /**
     * Verifica la contraseña del usuario de forma tolerante y segura,
     * normalizando variantes bcrypt ($2b$, $2a$), soportando rehash automático
     * y evitando que discrepancias de algoritmo disparen excepciones 500 no capturadas.
     */
    protected function verifyUserPassword(string $plainPassword, User $user): bool
    {
        $hashed = (string) $user->password;
        if ($hashed === '') {
            return false;
        }

        // 1. Normalizar variantes de bcrypt de Node.js/OpenBSD ($2b$ y $2a$) a estándar PHP ($2y$)
        $normalizedHash = $hashed;
        if (str_starts_with($hashed, '$2b$') || str_starts_with($hashed, '$2a$')) {
            $normalizedHash = '$2y$' . substr($hashed, 4);
        }

        $isMatch = false;

        // 2. Intentar verificación con password_verify y Hash::check de forma segura (tolerante a espacios accidentales)
        try {
            $trimmed = trim($plainPassword);
            if (password_verify($plainPassword, $normalizedHash) ||
                ($trimmed !== '' && password_verify($trimmed, $normalizedHash))) {
                $isMatch = true;
            } elseif (Hash::check($plainPassword, $normalizedHash) ||
                      ($trimmed !== '' && Hash::check($trimmed, $normalizedHash))) {
                $isMatch = true;
            }
        } catch (\Throwable $e) {
            report($e);
        }

        // 3. Fallback en caso de contraseñas heredadas en texto plano
        if (!$isMatch && (hash_equals($hashed, $plainPassword) || hash_equals($hashed, trim($plainPassword)))) {
            $isMatch = true;
        }

        // 4. Si la autenticación fue exitosa pero el hash no era estándar ($2b$, plano, o costo desactualizado),
        // rehashear y persistir de forma transparente para el usuario
        if ($isMatch) {
            $needsRehash = ($normalizedHash !== $hashed);
            try {
                if (!$needsRehash && Hash::needsRehash($user->password)) {
                    $needsRehash = true;
                }
            } catch (\Throwable) {
                // Silencioso ante cualquier discrepancia de Hash::needsRehash
            }

            if ($needsRehash && $user->exists) {
                try {
                    $user->password = Hash::make(trim($plainPassword) !== '' ? trim($plainPassword) : $plainPassword);
                    $user->save();
                } catch (\Throwable $e) {
                    report($e);
                }
            }
        }

        return $isMatch;
    }

    /**
     * Solicita código de recuperación de contraseña vía email o código de respaldo.
     */
    public function forgotPassword(string $email): array
    {
        $cleanEmail = strtolower(trim($email));
        $user = User::where('email', $cleanEmail)->first();

        if (!$user) {
            // Respuesta neutral defensiva (OWASP) para evitar enumeración de usuarios
            return [
                'message' => 'Si el correo electrónico está registrado, recibirás un código de recuperación.',
            ];
        }

        $resetCode = sprintf('%06d', mt_rand(100000, 999999));
        Cache::put("password_reset_code_{$user->id}", $resetCode, now()->addMinutes(30));
        Cache::put("password_reset_code_{$cleanEmail}", $resetCode, now()->addMinutes(30));

        $resetUrl = rtrim(config('app.frontend_url', 'https://www.sysengacademy.site'), '/')
            . '/auth/login?mode=reset&email=' . urlencode($cleanEmail)
            . '&code=' . urlencode($resetCode);

        $mailResult = TransactionalMailService::sendDetailed(
            toEmail: $user->email,
            subject: "Código de Recuperación: {$resetCode} - SysEng Academy",
            view: 'emails.verify-code',
            viewData: [
                'userName'   => $user->name,
                'verifyCode' => $resetCode,
                'userEmail'  => $user->email,
                'verifyUrl'  => $resetUrl,
                'actionText' => 'Restablecer mi Contraseña →',
            ]
        );

        $sent = $mailResult['success'] ?? false;
        if (!$sent) {
            logger()->error("AuthService: Fallo al enviar código de recuperación a {$user->email}. Error: " . ($mailResult['error'] ?? 'desconocido'));
        } else {
            logger()->info("AuthService: Código de recuperación enviado con éxito a {$user->email}. ID: " . ($mailResult['id'] ?? 'n/a'));
        }

        return [
            'message' => 'Código de recuperación enviado a tu correo. Por favor revisa tu bandeja de entrada o spam.',
            'sent'    => $sent,
        ];
    }

    /**
     * Restablece la contraseña de un usuario mediante código de verificación.
     */
    public function resetPassword(string $email, string $code, string $newPassword): array
    {
        $cleanEmail = strtolower(trim($email));
        $user = User::where('email', $cleanEmail)->first();

        if (!$user) {
            abort(404, 'Usuario no encontrado.');
        }

        $expectedCode = Cache::get("password_reset_code_{$user->id}")
            ?? Cache::get("password_reset_code_{$cleanEmail}");

        $trimmedCode = trim($code);

        if ($expectedCode && hash_equals((string) $expectedCode, (string) $trimmedCode)) {
            $user->password = Hash::make($newPassword);
            $user->save();
            Cache::forget("password_reset_code_{$user->id}");
            Cache::forget("password_reset_code_{$cleanEmail}");

            TransactionalMailService::send(
                toEmail: $user->email,
                subject: "Tu contraseña ha sido restablecida - SysEng Academy",
                view: 'emails.password-changed',
                viewData: [
                    'userName'  => $user->name,
                    'userEmail' => $user->email,
                    'actionUrl' => config('app.frontend_url', 'https://www.sysengacademy.site') . '/login',
                ]
            );

            return [
                'message' => 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.',
                'user'    => $user,
            ];
        }

        abort(422, 'El código de verificación es inválido o ha expirado.');
    }

    /**
     * Actualiza la contraseña de un usuario autenticado.
     */
    public function changePassword(User $user, string $newPassword, ?string $currentPassword = null): array
    {
        $dbUser = User::find($user->id) ?? $user;

        if (!empty($currentPassword)) {
            if (!$this->verifyUserPassword($currentPassword, $dbUser)) {
                abort(422, 'La contraseña actual ingresada es incorrecta.');
            }
        }

        $dbUser->password = Hash::make($newPassword);
        $dbUser->save();

        Cache::forget("jwt.user.{$dbUser->id}");

        TransactionalMailService::send(
            toEmail: $dbUser->email,
            subject: "Tu contraseña ha sido actualizada - SysEng Academy",
            view: 'emails.password-changed',
            viewData: [
                'userName'  => $dbUser->name,
                'userEmail' => $dbUser->email,
                'actionUrl' => config('app.frontend_url', 'https://www.sysengacademy.site') . '/login',
            ]
        );

        return [
            'message' => 'Contraseña actualizada exitosamente.',
            'user'    => $dbUser,
        ];
    }

    /**
     * Envía un correo de diagnóstico y comprobación de entrega para verificar
     * si el buzón del usuario o estudiante puede recibir mensajes sin bloqueos.
     */
    public function testEmailDelivery(string $email, ?User $user = null): array
    {
        $cleanEmail = strtolower(trim($email));
        if (!$user) {
            $user = User::where('email', $cleanEmail)->first();
        }

        $userName = $user ? $user->name : 'Estudiante';
        $checkCode = sprintf('%06d', mt_rand(100000, 999999));

        // Cache por 15 minutos para validación opcional
        Cache::put("test_email_check_{$cleanEmail}", $checkCode, now()->addMinutes(15));
        if ($user) {
            Cache::put("test_email_check_user_{$user->id}", $checkCode, now()->addMinutes(15));
        }

        $sentResult = TransactionalMailService::sendDetailed(
            toEmail: $cleanEmail,
            subject: "⚡ Diagnóstico de Correo: Código {$checkCode} - SysEng Academy",
            view: 'emails.email-check',
            viewData: [
                'userName'   => $userName,
                'userEmail'  => $cleanEmail,
                'checkCode'  => $checkCode,
                'actionUrl'  => config('app.frontend_url', 'https://www.sysengacademy.site') . '/perfil?tab=security',
            ]
        );

        return [
            'success'   => $sentResult['success'] ?? false,
            'sent'      => $sentResult['success'] ?? false,
            'provider'  => $sentResult['provider'] ?? 'unknown',
            'resend_id' => $sentResult['id'] ?? null,
            'error'     => $sentResult['error'] ?? null,
            'email'     => $cleanEmail,
            'message'   => "Mensaje de confirmación enviado exitosamente a {$cleanEmail}. Revisa tu bandeja de entrada o spam.",
        ];
    }

    /**
     * Valida el código de confirmación del test de buzón para certificar la recepción.
     */
    public function confirmTestEmail(string $email, string $code, ?User $user = null): array
    {
        $cleanEmail = strtolower(trim($email));
        if (!$user) {
            $user = User::where('email', $cleanEmail)->first();
        }

        $expectedCode = Cache::get("test_email_check_{$cleanEmail}")
            ?? ($user ? Cache::get("test_email_check_user_{$user->id}") : null);

        $trimmedCode = trim($code);

        if ($expectedCode && hash_equals((string) $expectedCode, (string) $trimmedCode)) {
            if ($user && !$user->email_verified_at) {
                $user->email_verified_at = now();
                $user->save();
            }

            Cache::forget("test_email_check_{$cleanEmail}");
            if ($user) {
                Cache::forget("test_email_check_user_{$user->id}");
            }

            return [
                'success'  => true,
                'verified' => true,
                'message'  => '¡Buzón verificado exitosamente! Tu cuenta puede recibir todas las notificaciones y códigos de seguridad.',
            ];
        }

        abort(422, 'El código de comprobación es incorrecto o ha expirado. Por favor solicita un nuevo envío de prueba.');
    }
}
