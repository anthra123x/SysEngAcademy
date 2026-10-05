<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentFeedback;
use App\Models\User;
use App\Models\UserDailyActivity;
use App\Modules\Users\Services\StudentProfileService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(
        protected StudentProfileService $profileService
    ) {}

    /**
     * Retorna el expediente, progreso y estadísticas del usuario autenticado.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            abort(401, 'No autenticado.');
        }

        $summary = $this->profileService->getProfileSummary($user);

        return response()->json($summary);
    }

    /**
     * Retorna el historial de retroalimentaciones y llamados de atención del usuario.
     */
    public function feedbacks(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json([]);
        }

        $includeDismissed = $request->boolean('include_dismissed', false);

        $query = StudentFeedback::where('student_id', $user->id);
        if (!$includeDismissed) {
            $query->where('is_dismissed', false);
        }

        $feedbacks = $query->orderBy('created_at', 'desc')->get();

        return response()->json($feedbacks);
    }

    /**
     * Subsanar y resolver un llamado de atención (apelación) realizando la actividad requerida.
     * Restituye los puntos de experiencia (XP) descontados en el ranking.
     */
    public function remediateFeedback(Request $request, int $id): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $feedback = StudentFeedback::where('id', $id)
            ->where('student_id', $user->id)
            ->first();

        if (!$feedback) {
            return response()->json(['error' => 'Llamado de atención no encontrado'], 404);
        }

        if ($feedback->is_resolved) {
            return response()->json([
                'success'     => true,
                'message'     => 'Este llamado de atención ya fue subsanado previamente.',
                'feedback'    => $feedback,
                'restored_xp' => 0,
                'student_xp'  => $user->xp,
            ]);
        }

        $validated = $request->validate([
            'action_name'  => 'nullable|string|max:200',
            'action_notes' => 'nullable|string|max:500',
        ]);

        $actionName = $validated['action_name'] ?? 'Reto práctico de regularización completado';

        // Restituir XP deducido al ranking del estudiante
        $restoredXp = 0;
        if ($feedback->xp_impact < 0) {
            $restoredXp = abs($feedback->xp_impact);
            $user->xp = ($user->xp ?: 0) + $restoredXp;
            $user->save();
        }

        // Marcar como subsanado / resuelto
        $feedback->update([
            'status'             => 'resolved',
            'is_resolved'        => true,
            'resolved_at'        => Carbon::now(),
            'remediation_action' => $actionName,
        ]);

        // Registrar actividad de subsanación
        $today = Carbon::now()->toDateString();
        $daily = UserDailyActivity::firstOrCreate(
            ['user_id' => $user->id, 'activity_date' => $today],
            ['study_seconds' => 0, 'lessons_completed' => 0, 'quizzes_completed' => 0, 'challenges_completed' => 0]
        );
        $daily->challenges_completed += 1;
        $daily->study_seconds += 60;
        $daily->save();

        return response()->json([
            'success'     => true,
            'message'     => "¡Llamado de atención subsanado exitosamente! Se han restituido +{$restoredXp} XP a tu ranking.",
            'feedback'    => $feedback,
            'restored_xp' => $restoredXp,
            'student_xp'  => $user->fresh()->xp,
        ]);
    }

    /**
     * Limpia / descarta una notificación del expediente activo del estudiante.
     */
    public function dismissFeedback(Request $request, int $id): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $feedback = StudentFeedback::where('id', $id)
            ->where('student_id', $user->id)
            ->first();

        if (!$feedback) {
            return response()->json(['error' => 'Notificación no encontrada'], 404);
        }

        $feedback->update([
            'is_dismissed' => true,
            'dismissed_at' => Carbon::now(),
            'is_read'      => true,
        ]);

        return response()->json([
            'success'     => true,
            'message'     => 'Notificación limpiada de tu expediente activo.',
            'feedback_id' => $id,
        ]);
    }

    /**
     * Limpia todas las notificaciones resueltas del expediente activo.
     */
    public function clearResolvedFeedbacks(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $count = StudentFeedback::where('student_id', $user->id)
            ->where('is_resolved', true)
            ->where('is_dismissed', false)
            ->update([
                'is_dismissed' => true,
                'dismissed_at' => Carbon::now(),
                'is_read'      => true,
            ]);

        return response()->json([
            'success'       => true,
            'message'       => "Se han limpiado {$count} notificaciones subsanadas.",
            'cleared_count' => $count,
        ]);
    }

    private function resolveUser(Request $request): ?User
    {
        if ($user = $request->user()) {
            return $user;
        }

        $email = $request->input('email') ?: $request->query('email');
        if ($email) {
            return User::where('email', strtolower(trim($email)))->first();
        }

        return User::first();
    }
}
