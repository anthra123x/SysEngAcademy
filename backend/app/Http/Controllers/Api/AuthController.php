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

    public function register(Request $request): JsonResponse
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
        $result = $this->authService->register($dto);

        return response()->json($result, 201);
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
        $request->validate([
            'email' => 'nullable|email',
        ]);

        $result = $this->authService->resendVerification(
            email: $request->email,
            user: $request->user()
        );

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
}
