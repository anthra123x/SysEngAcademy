<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\StreakService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StreakController extends Controller
{
    public function __construct(
        protected StreakService $streakService
    ) {}

    /**
     * Heartbeat en tiempo real: registra el tiempo activo de estudio
     * y actualiza de manera matemáticamente exacta la racha diaria.
     */
    public function ping(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $validated = $request->validate([
            'delta_seconds' => 'nullable|integer|min:1|max:180',
            'tz'            => 'nullable|string|max:50',
            'action'        => 'nullable|string|in:pulse,lesson_complete,quiz_pass,challenge_solve',
        ]);

        $deltaSeconds = min(120, max(5, (int) ($validated['delta_seconds'] ?? 30)));
        $tz = $this->resolveTimezone($validated['tz'] ?? null);
        $action = $validated['action'] ?? 'pulse';

        $data = $this->streakService->processPing($user, $deltaSeconds, $action, $tz);

        return response()->json($data);
    }

    /**
     * Consulta el estado de racha y actividad del usuario autenticado.
     */
    public function status(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $tz = $this->resolveTimezone($request->query('tz'));
        $data = $this->streakService->getStatus($user, $tz);

        return response()->json($data);
    }

    /**
     * Retorna un ejercicio conceptual para recuperar la racha apagada.
     */
    public function recoveryDrill(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $drills = $this->streakService->getRecoveryDrills();
        $selected = $drills[array_rand($drills)];

        $payload = [
            'id'           => $selected['id'],
            'category'     => $selected['category'],
            'difficulty'   => $selected['difficulty'],
            'question'     => $selected['question'],
            'options'      => $selected['options'],
            'hint'         => $selected['hint'] ?? null,
            'code_snippet' => $selected['code_snippet'] ?? null,
        ];

        return response()->json($payload);
    }

    /**
     * Valida la solución al ejercicio y restaura la racha apagada del estudiante.
     */
    public function recover(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $validated = $request->validate([
            'drill_id' => 'required|string|max:50',
            'answer'   => 'required|string|max:100',
            'tz'       => 'nullable|string|max:50',
        ]);

        $tz = $this->resolveTimezone($validated['tz'] ?? null);
        $result = $this->streakService->recoverStreak($user, $validated['drill_id'], $validated['answer'], $tz);

        return response()->json($result['payload'], $result['status']);
    }

    private function resolveUser(Request $request): ?User
    {
        return $request->user('jwt') ?: $request->user('sanctum') ?: $request->user();
    }

    private function resolveTimezone(?string $tz): string
    {
        if ($tz && in_array($tz, \DateTimeZone::listIdentifiers(), true)) {
            return $tz;
        }
        return 'America/Bogota';
    }
}
