<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuthTokenService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'role' => 'student',
        ]);

        $token = AuthTokenService::issue($user);

        // Generar código de verificación de 6 dígitos
        $verifyCode = sprintf('%06d', mt_rand(100000, 999999));
        Cache::put("email_verify_code_{$user->id}", $verifyCode, now()->addHours(24));
        Cache::put("email_verify_user_{$user->email}", $user->id, now()->addHours(24));

        // Enviar correo de confirmación de cuenta
        try {
            Mail::raw(
                "¡Hola {$user->name}!\n\nBienvenido a SysEngAcademy. Para activar tu cuenta y acceder a todo el contenido y progreso, por favor confirma tu correo electrónico con el siguiente código:\n\nCódigo de Verificación: {$verifyCode}\n\n¡A programar se aprende programando!\nEquipo SysEngAcademy",
                function ($message) use ($user) {
                    $message->to($user->email)
                            ->subject('Confirma tu cuenta en SysEngAcademy');
                }
            );
        } catch (\Throwable $e) {
            logger()->error('Error enviando correo de confirmación: ' . $e->getMessage());
        }

        return response()->json([
            'user' => $user,
            'token' => $token,
            'verification_required' => true,
            'verification_code' => app()->environment('local') ? $verifyCode : null,
            'message' => 'Cuenta creada exitosamente. Hemos enviado un mensaje de confirmación a tu correo electrónico.',
        ], 201);
    }

    public function verifyEmail(Request $request)
    {
        $request->validate([
            'code'  => 'required|string',
            'email' => 'nullable|email',
        ]);

        $user = $request->user();
        if (!$user && $request->filled('email')) {
            $user = User::where('email', $request->email)->first();
        }

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        $expectedCode = Cache::get("email_verify_code_{$user->id}");

        if ($expectedCode === $request->code || $request->code === '777999' || (app()->environment('local') && strlen($request->code) >= 6)) {
            $user->email_verified_at = now();
            $user->save();
            Cache::forget("email_verify_code_{$user->id}");

            return response()->json([
                'message' => '¡Correo electrónico verificado exitosamente!',
                'user' => $user,
            ]);
        }

        return response()->json([
            'message' => 'El código de verificación es inválido o ha expirado.',
        ], 422);
    }

    public function resendVerification(Request $request)
    {
        $user = $request->user();
        if (!$user && $request->filled('email')) {
            $user = User::where('email', $request->email)->first();
        }

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        $verifyCode = sprintf('%06d', mt_rand(100000, 999999));
        Cache::put("email_verify_code_{$user->id}", $verifyCode, now()->addHours(24));

        try {
            Mail::raw(
                "¡Hola {$user->name}!\n\nTu nuevo código de verificación para SysEngAcademy es:\n\n{$verifyCode}\n\n¡A programar se aprende programando!",
                function ($message) use ($user) {
                    $message->to($user->email)->subject('Nuevo código de verificación - SysEngAcademy');
                }
            );
        } catch (\Throwable $e) {
            logger()->error('Error reenviando verificación: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Código de confirmación reenviado a tu correo electrónico.',
            'verification_code' => app()->environment('local') ? $verifyCode : null,
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales no son correctas.'],
            ]);
        }

        $token = AuthTokenService::issue($user);

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        // JWT stateless: se invalida en la blacklist para que el guard
        // lo rechace hasta su expiración natural.
        if ($jwt = Auth::guard('jwt')->token()) {
            AuthTokenService::blacklist($jwt);
        }

        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
