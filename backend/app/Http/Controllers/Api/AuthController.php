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
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
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
        $validated = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
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
