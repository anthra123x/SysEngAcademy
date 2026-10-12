<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Auth\DTOs\LoginDTO;
use App\Modules\Auth\DTOs\RegisterDTO;
use App\Modules\Auth\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {}

    public function requestRegistrationCode(Request $request): JsonResponse
    {
        // 1. Sanitizar y normalizar entradas en la frontera (OWASP)
        $cleanEmail = strtolower(trim((string) $request->input('email', '')));
        $cleanName  = trim(preg_replace('/\s+/', ' ', (string) $request->input('name', '')));

        $request->merge([
            'email' => $cleanEmail,
            'name'  => $cleanName,
        ]);

        $validated = $request->validate([
            'name'     => 'required|string|min:3|max:255',
            'email'    => 'required|string|email|max:255|unique:users,email',
            'password' => ['required', 'string', 'min:8', 'confirmed', 'regex:/[a-zA-Z]/', 'regex:/[0-9]/'],
        ], [
            'name.required'      => 'El nombre completo es obligatorio.',
            'name.min'           => 'El nombre debe contener al menos 3 caracteres.',
            'name.max'           => 'El nombre no puede exceder los 255 caracteres.',
            'email.required'     => 'El correo electrónico es obligatorio.',
            'email.email'        => 'Por favor ingresa un correo electrónico válido (ejemplo: usuario@correo.com).',
            'email.unique'       => 'Este correo electrónico ya se encuentra registrado. ¿Deseas iniciar sesión?',
            'password.required'  => 'La contraseña es obligatoria.',
            'password.min'       => 'La contraseña debe contener al menos 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden. Por favor verifica ambos campos.',
            'password.regex'     => 'Por seguridad, la contraseña debe contener al menos una letra y un número.',
        ]);

        $dto = RegisterDTO::fromArray($validated);
        $result = $this->authService->requestRegistrationCode($dto);

        return response()->json($result, 200);
    }

    public function confirmRegistration(Request $request): JsonResponse
    {
        $cleanEmail = strtolower(trim((string) $request->input('email', '')));
        $request->merge(['email' => $cleanEmail]);

        $validated = $request->validate([
            'email' => 'required|email',
            'code'  => 'required|string|size:6',
        ], [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email'    => 'Por favor ingresa un correo electrónico válido.',
            'code.required'  => 'El código de activación es obligatorio.',
            'code.size'      => 'El código debe tener exactamente 6 dígitos.',
        ]);

        $result = $this->authService->confirmRegistration(
            email: $validated['email'],
            code: $validated['code']
        );

        return response()->json($result, 201);
    }

    public function resendRegistrationCode(Request $request): JsonResponse
    {
        $cleanEmail = strtolower(trim((string) $request->input('email', '')));
        $request->merge(['email' => $cleanEmail]);

        $validated = $request->validate([
            'email' => 'required|email',
        ], [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email'    => 'Por favor ingresa un correo electrónico válido.',
        ]);

        $result = $this->authService->resendRegistrationCode($validated['email']);

        return response()->json($result);
    }

    public function register(Request $request): JsonResponse
    {
        if ($request->filled('code')) {
            return $this->confirmRegistration($request);
        }

        return $this->requestRegistrationCode($request);
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $request->validate([
            'code'  => 'required|string',
            'email' => 'nullable|email',
        ]);

        $result = $this->authService->verifyEmail(
            code: $request->code,
            email: $request->email,
            user: $request->user()
        );

        return response()->json($result);
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $cleanEmail = strtolower(trim((string) ($request->input('email') ?? $request->user()?->email)));

        if (empty($cleanEmail)) {
            return response()->json(['message' => 'El correo electrónico es obligatorio.'], 422);
        }

        $result = $this->authService->resendRegistrationCode($cleanEmail);

        return response()->json($result);
    }

    public function login(Request $request): JsonResponse
    {
        $request->merge([
            'email' => strtolower(trim((string) $request->input('email', ''))),
        ]);

        $validated = $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ], [
            'email.required'    => 'El correo electrónico es obligatorio.',
            'email.email'       => 'Por favor ingresa un correo electrónico válido.',
            'password.required' => 'La contraseña es obligatoria.',
        ]);

        $dto = LoginDTO::fromArray($validated);
        $result = $this->authService->login($dto);

        return response()->json($result);
    }

    public function logout(Request $request): JsonResponse
    {
        $result = $this->authService->logout();
        return response()->json($result);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
        ], [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email'    => 'Por favor ingresa un correo electrónico válido.',
        ]);

        $result = $this->authService->forgotPassword($validated['email']);
        return response()->json($result);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'              => 'required|string|email',
            'code'               => 'required|string',
            'password'          => ['required', 'string', 'min:6', 'confirmed'],
        ], [
            'email.required'     => 'El correo electrónico es obligatorio.',
            'code.required'      => 'El código de recuperación es obligatorio.',
            'password.required'  => 'La nueva contraseña es obligatoria.',
            'password.min'       => 'La contraseña debe contener al menos 6 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ]);

        $result = $this->authService->resetPassword(
            email: $validated['email'],
            code: $validated['code'],
            newPassword: $validated['password']
        );

        return response()->json($result);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'nullable|string',
            'password'         => ['required', 'string', 'min:6', 'confirmed'],
        ], [
            'password.required'  => 'La nueva contraseña es obligatoria.',
            'password.min'       => 'La nueva contraseña debe contener al menos 6 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ]);

        $user = $request->user('jwt') ?: $request->user('sanctum') ?: $request->user();
        if (!$user) {
            return response()->json(['message' => 'No autorizado.'], 401);
        }

        $result = $this->authService->changePassword(
            user: $user,
            newPassword: $validated['password'],
            currentPassword: $validated['current_password'] ?? null
        );

        return response()->json($result);
    }

    public function testEmail(Request $request): JsonResponse
    {
        $user = $request->user('jwt') ?: $request->user('sanctum') ?: $request->user();

        $email = $request->input('email');
        if (empty($email) && $user) {
            $email = $user->email;
        }

        $request->merge(['email' => strtolower(trim((string) $email))]);

        $validated = $request->validate([
            'email' => 'required|email',
        ], [
            'email.required' => 'El correo electrónico es obligatorio para realizar la prueba.',
            'email.email'    => 'Por favor ingresa un correo electrónico válido.',
        ]);

        $result = $this->authService->testEmailDelivery(
            email: $validated['email'],
            user: $user
        );

        return response()->json($result);
    }

    public function confirmTestEmail(Request $request): JsonResponse
    {
        $user = $request->user('jwt') ?: $request->user('sanctum') ?: $request->user();

        $email = $request->input('email');
        if (empty($email) && $user) {
            $email = $user->email;
        }

        $request->merge(['email' => strtolower(trim((string) $email))]);

        $validated = $request->validate([
            'email' => 'required|email',
            'code'  => 'required|string',
        ], [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email'    => 'Correo electrónico no válido.',
            'code.required'  => 'El código de comprobación es obligatorio.',
        ]);

        $result = $this->authService->confirmTestEmail(
            email: $validated['email'],
            code: $validated['code'],
            user: $user
        );

        return response()->json($result);
    }
}
