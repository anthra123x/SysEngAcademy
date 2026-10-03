<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Academics\Services\StudentManagementService;
use App\Modules\Academics\Services\StudentRosterService;
use App\Modules\Academics\Services\TeacherAnalyticsService;
use App\Modules\Users\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherController extends Controller
{
    public function __construct(
        protected TeacherAnalyticsService $analyticsService,
        protected StudentRosterService $rosterService,
        protected StudentManagementService $managementService,
        protected UserService $userService
    ) {}

    /**
     * Valida que el usuario autenticado sea docente o administrador.
     */
    private function authorizeTeacher(Request $request): void
    {
        $user = $request->user();
        if (!$user) {
            abort(401, 'No autenticado.');
        }

        if (!$this->userService->isTeacherOrAdmin($user)) {
            abort(403, 'Acceso restringido al Panel de Docentes y Administración.');
        }
    }

    /**
     * Resumen general y estadísticas académicas para el panel docente.
     */
    public function overview(Request $request): JsonResponse
    {
        $this->authorizeTeacher($request);
        $data = $this->analyticsService->getOverview();

        return response()->json($data);
    }

    /**
     * Lista de estudiantes con métricas de progreso individual.
     */
    public function students(Request $request): JsonResponse
    {
        $this->authorizeTeacher($request);
        $search = $request->query('search');
        $students = $this->rosterService->getRoster($search);

        return response()->json($students);
    }

    /**
     * Expediente académico detallado de un estudiante específico.
     */
    public function studentDetail(Request $request, int $id): JsonResponse
    {
        $this->authorizeTeacher($request);
        $detail = $this->managementService->getStudentDetail($id);

        return response()->json($detail);
    }

    /**
     * Actualiza la cuenta de un estudiante (rol, verificación de email).
     */
    public function updateStudent(Request $request, int $id): JsonResponse
    {
        $this->authorizeTeacher($request);

        $validated = $request->validate([
            'name'         => 'sometimes|string|max:255',
            'role'         => 'sometimes|string|in:student,instructor,admin',
            'verify_email' => 'sometimes|boolean',
        ]);

        $student = $this->managementService->updateStudent($id, $validated);
        $this->analyticsService->invalidateCache();

        return response()->json([
            'message' => 'Cuenta de estudiante actualizada correctamente.',
            'student' => $student,
        ]);
    }

    /**
     * Elimina la cuenta de un estudiante y sus progresos asociados.
     */
    public function deleteStudent(Request $request, int $id): JsonResponse
    {
        $this->authorizeTeacher($request);
        $this->managementService->deleteStudent($id);
        $this->analyticsService->invalidateCache();

        return response()->json(['message' => 'Estudiante eliminado satisfactoriamente.']);
    }

    /**
     * Envía correos de resumen de progreso a los estudiantes de la cátedra.
     */
    public function sendProgressDigest(Request $request): JsonResponse
    {
        $this->authorizeTeacher($request);

        $students = \App\Models\User::whereNotNull('email_verified_at')
            ->orWhere('role', 'student')
            ->get();

        $sentCount = 0;
        foreach ($students as $student) {
            try {
                $streak = max(1, $student->current_streak ?: 1);
                $lessons = $student->lessonProgress()->count();
                $xp = max(50, $student->xp ?: 50);

                \Illuminate\Support\Facades\Mail::send('emails.progress-digest', [
                    'userName'         => $student->name,
                    'userEmail'        => $student->email,
                    'streakDays'       => $streak,
                    'completedLessons' => $lessons,
                    'totalXp'          => $xp,
                ], function ($message) use ($student) {
                    $message->to($student->email)
                        ->subject('📊 Resumen de tu Progreso Académico - SysEng Academy');
                });
                $sentCount++;
            } catch (\Throwable $e) {
                logger()->error("Error enviando digest a {$student->email}: " . $e->getMessage());
            }
        }

        return response()->json([
            'message' => "Se despacharon {$sentCount} correos de progreso con diseño institucional a los estudiantes.",
            'sent_count' => $sentCount,
        ]);
    }

    /**
     * Envía alertas por correo de racha inactiva o riesgo de retraso con datos reales.
     */
    public function sendStreakReminder(Request $request): JsonResponse
    {
        $this->authorizeTeacher($request);

        $students = \App\Models\User::whereNotNull('email_verified_at')
            ->orWhere('role', 'student')
            ->get();

        $sentCount = 0;
        foreach ($students as $student) {
            try {
                $streak = max(1, $student->current_streak ?: 1);

                \Illuminate\Support\Facades\Mail::send('emails.streak-reminder', [
                    'userName'   => $student->name,
                    'userEmail'  => $student->email,
                    'streakDays' => $streak,
                ], function ($message) use ($student) {
                    $message->to($student->email)
                        ->subject('🔥 ¡Alerta! Tu racha en SysEng Academy está por vencerse');
                });
                $sentCount++;
            } catch (\Throwable $e) {
                logger()->error("Error enviando recordatorio a {$student->email}: " . $e->getMessage());
            }
        }

        return response()->json([
            'message' => "Se despacharon {$sentCount} correos de alerta de racha/atraso con diseño institucional.",
            'sent_count' => $sentCount,
        ]);
    }

    /**
     * Emite retroalimentación pedagógica o llamado de atención formal con impacto gamificado opcional.
     */
    public function sendFeedback(Request $request, int $id): JsonResponse
    {
        $this->authorizeTeacher($request);

        $validated = $request->validate([
            'type'               => 'required|string|in:pedagogical,praise,warning_mild,warning_strict',
            'title'              => 'required|string|max:255',
            'message'            => 'required|string',
            'ai_context_summary' => 'nullable|string',
            'xp_impact'          => 'nullable|integer',
            'xp_deduction'       => 'nullable|integer|min:0',
            'xp_bonus'           => 'nullable|integer|min:0',
        ]);

        $student = \App\Models\User::findOrFail($id);
        $teacher = $request->user();

        $type = $validated['type'];
        $xpImpact = (int) ($validated['xp_impact'] ?? 0);

        if ($type === 'warning_strict' && $xpImpact >= 0) {
            $deduction = !empty($validated['xp_deduction']) ? (int) $validated['xp_deduction'] : 50;
            $xpImpact = -$deduction;
        } elseif ($type === 'praise' && !empty($validated['xp_bonus'])) {
            $xpImpact = (int) $validated['xp_bonus'];
        }

        $feedback = \App\Models\StudentFeedback::create([
            'student_id'         => $student->id,
            'teacher_id'         => $teacher->id,
            'teacher_name'       => $teacher->name ?: 'Docente de Cátedra',
            'type'               => $type,
            'title'              => $validated['title'],
            'message'            => $validated['message'],
            'ai_context_summary' => $validated['ai_context_summary'] ?? null,
            'xp_impact'          => $xpImpact,
        ]);

        if ($xpImpact !== 0) {
            $currentXp = (int) ($student->xp ?: 100);
            $newXp = max(0, $currentXp + $xpImpact);
            $student->update(['xp' => $newXp]);
        }

        $this->analyticsService->invalidateCache();

        return response()->json([
            'message'   => 'Retroalimentación registrada en el expediente con éxito.',
            'feedback'  => $feedback,
            'xp_impact' => $xpImpact,
            'student_xp'=> $student->fresh()->xp,
        ], 201);
    }

    /**
     * Retorna el historial de retroalimentaciones y llamados de atención de un estudiante.
     */
    public function listFeedbacks(Request $request, int $id): JsonResponse
    {
        $this->authorizeTeacher($request);

        $feedbacks = \App\Models\StudentFeedback::where('student_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($feedbacks);
    }
}

