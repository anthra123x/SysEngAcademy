<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LessonProgress;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeacherController extends Controller
{
    /**
     * Valida que el usuario autenticado sea docente o administrador.
     */
    private function authorizeTeacher(Request $request): void
    {
        $user = $request->user();
        if (!$user) {
            abort(401, 'No autenticado.');
        }

        $isTeacher = in_array($user->role, ['admin', 'instructor']) 
            || $user->email === 'andrescamilomartinez330@gmail.com';

        if (!$isTeacher) {
            abort(403, 'Acceso restringido al Panel de Docentes y Administración.');
        }
    }

    /**
     * Resumen general y estadísticas académicas para el panel docente.
     */
    public function overview(Request $request): JsonResponse
    {
        $this->authorizeTeacher($request);

        $totalStudents = User::where('role', 'student')->count();
        $totalCourses = Course::count();
        $totalCompletions = LessonProgress::count();
        $totalEnrollments = Enrollment::count();

        // Promedio global de quizzes (solo lecciones con puntaje registrado)
        $avgScore = (float) LessonProgress::whereNotNull('score')->avg('score') ?? 0.0;

        // Actividad reciente (últimas 10 lecciones completadas o quizzes)
        $recentActivity = LessonProgress::with(['user:id,name,email', 'lesson:id,title,type'])
            ->orderBy('completed_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($p) {
                return [
                    'id'           => $p->id,
                    'user_name'    => $p->user?->name ?? 'Estudiante',
                    'user_email'   => $p->user?->email ?? '',
                    'lesson_title' => $p->lesson?->title ?? 'Lección',
                    'lesson_type'  => $p->lesson?->type ?? 'article',
                    'score'        => $p->score,
                    'passed'       => $p->score !== null ? $p->score >= 60 : true,
                    'completed_at' => $p->completed_at ? $p->completed_at->toIso8601String() : null,
                ];
            });

        // Top cursos con más alumnos
        $popularCourses = Course::withCount('enrollments')
            ->orderBy('enrollments_count', 'desc')
            ->take(5)
            ->get(['id', 'title', 'slug', 'difficulty', 'enrollments_count']);

        return response()->json([
            'stats' => [
                'total_students'    => $totalStudents,
                'total_courses'     => $totalCourses,
                'total_completions' => $totalCompletions,
                'total_enrollments' => $totalEnrollments,
                'average_score'     => round($avgScore, 1),
            ],
            'recent_activity'  => $recentActivity,
            'popular_courses'  => $popularCourses,
        ]);
    }

    /**
     * Lista completa de estudiantes con métricas de progreso individual.
     */
    public function students(Request $request): JsonResponse
    {
        $this->authorizeTeacher($request);

        $search = $request->query('search');

        $query = User::where('role', 'student')
            ->withCount(['enrollments', 'lessonProgress'])
            ->with(['enrollments.course:id,title', 'lessonProgress']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        $students = $query->orderBy('created_at', 'desc')->get()->map(function ($u) {
            $scores = $u->lessonProgress->pluck('score')->filter()->values();
            $avgScore = $scores->count() > 0 ? round($scores->avg(), 1) : null;

            return [
                'id'                      => $u->id,
                'name'                    => $u->name,
                'email'                   => $u->email,
                'role'                    => $u->role,
                'email_verified'          => !empty($u->email_verified_at),
                'email_verified_at'       => $u->email_verified_at ? $u->email_verified_at->toIso8601String() : null,
                'created_at'              => $u->created_at ? $u->created_at->toIso8601String() : null,
                'enrollments_count'       => $u->enrollments_count,
                'completed_lessons_count' => $u->lesson_progress_count,
                'quizzes_taken_count'     => $scores->count(),
                'average_quiz_score'      => $avgScore,
                'courses'                 => $u->enrollments->map(fn($e) => [
                    'id'               => $e->course_id,
                    'title'            => $e->course?->title ?? 'Curso',
                    'progress_percent' => $e->progress_percent ?? 0,
                ]),
            ];
        });

        return response()->json($students);
    }

    /**
     * Expediente académico detallado de un estudiante específico.
     */
    public function studentDetail(Request $request, int $id): JsonResponse
    {
        $this->authorizeTeacher($request);

        $student = User::with([
            'enrollments.course.modules.lessons',
            'lessonProgress.lesson.module.course',
        ])->findOrFail($id);

        $completedProgress = $student->lessonProgress->map(function ($lp) {
            return [
                'id'           => $lp->id,
                'lesson_id'    => $lp->lesson_id,
                'lesson_title' => $lp->lesson?->title ?? 'Lección',
                'lesson_type'  => $lp->lesson?->type ?? 'article',
                'course_title' => $lp->lesson?->module?->course?->title ?? 'General',
                'score'        => $lp->score,
                'passed'       => $lp->score !== null ? $lp->score >= 60 : null,
                'completed_at' => $lp->completed_at ? $lp->completed_at->toIso8601String() : null,
            ];
        });

        $enrolledCourses = $student->enrollments->map(function ($e) {
            return [
                'id'               => $e->id,
                'course_id'        => $e->course_id,
                'title'            => $e->course?->title ?? 'Curso',
                'progress_percent' => $e->progress_percent,
                'enrolled_at'      => $e->enrolled_at,
                'completed_at'     => $e->completed_at,
            ];
        });

        $scores = $student->lessonProgress->pluck('score')->filter()->values();

        return response()->json([
            'student' => [
                'id'                => $student->id,
                'name'              => $student->name,
                'email'             => $student->email,
                'role'              => $student->role,
                'email_verified'    => !empty($student->email_verified_at),
                'email_verified_at' => $student->email_verified_at,
                'created_at'        => $student->created_at,
            ],
            'academic_summary' => [
                'total_enrolled'    => $enrolledCourses->count(),
                'total_completed'   => $completedProgress->count(),
                'quizzes_taken'     => $scores->count(),
                'average_score'     => $scores->count() > 0 ? round($scores->avg(), 1) : null,
            ],
            'courses'            => $enrolledCourses,
            'completed_lessons'  => $completedProgress,
        ]);
    }

    /**
     * Actualiza o administra la cuenta de un estudiante (verificar correo, cambiar rol).
     */
    public function updateStudent(Request $request, int $id): JsonResponse
    {
        $this->authorizeTeacher($request);

        $student = User::findOrFail($id);

        $validated = $request->validate([
            'name'           => 'sometimes|string|max:255',
            'role'           => 'sometimes|string|in:student,instructor,admin',
            'verify_email'   => 'sometimes|boolean',
        ]);

        if (isset($validated['name'])) {
            $student->name = $validated['name'];
        }

        if (isset($validated['role'])) {
            $student->role = $validated['role'];
        }

        if (isset($validated['verify_email'])) {
            $student->email_verified_at = $validated['verify_email'] ? now() : null;
        }

        $student->save();

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

        $student = User::findOrFail($id);
        if ($student->email === 'andrescamilomartinez330@gmail.com') {
            return response()->json(['message' => 'No es posible eliminar la cuenta principal del docente.'], 403);
        }

        // Eliminar progresos y matrículas asociadas
        $student->lessonProgress()->delete();
        $student->enrollments()->delete();
        $student->delete();

        return response()->json(['message' => 'Estudiante eliminado satisfactoriamente.']);
    }
}
