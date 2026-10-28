<?php

namespace App\Http\Middleware;

use App\Modules\Users\Services\UserService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTeacherOrAdmin
{
    public function __construct(
        protected UserService $userService
    ) {}

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user('jwt') ?: $request->user('sanctum') ?: $request->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        if (!$this->userService->isTeacherOrAdmin($user)) {
            return response()->json(['message' => 'Acceso restringido al Panel de Docentes y Administración.'], 403);
        }

        return $next($request);
    }
}
