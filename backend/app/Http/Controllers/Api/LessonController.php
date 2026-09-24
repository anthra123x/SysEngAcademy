<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class LessonController extends Controller
{
    public function show(Request $request, string $slug)
    {
        $lesson = Cache::remember("api.lesson.v1.{$slug}", now()->addMinutes(10), function () use ($slug) {
            return Lesson::with(['module.course', 'quiz.questions.answers'])
                ->where('slug', $slug)
                ->firstOrFail()
                ->toArray();
        });

        // Acceso libre si es preview, de lo contrario requiere inscripción
        if (! $lesson['is_preview']) {
            $user = $request->user('jwt') ?: $request->user('sanctum');

            if (! $user) {
                throw new AuthenticationException('Debes iniciar sesión para acceder a esta lección.');
            }

            $courseId = $lesson['module']['course_id'];
            $enrolled = $user->enrollments()
                ->where('course_id', $courseId)->exists();

            if (! $enrolled) {
                return response()->json(['message' => 'Debes inscribirte en el curso para acceder a esta lección.'], 403);
            }
        }

        return response()->json($lesson);
    }

    public function complete(Request $request, Lesson $lesson)
    {
        $courseId = $lesson->module->course_id;

        $enrollment = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $courseId)
            ->firstOrFail();

        LessonProgress::updateOrCreate(
            ['user_id' => $request->user()->id, 'lesson_id' => $lesson->id],
            ['completed_at' => now(), 'score' => $request->score]
        );

        // Recalcular progreso del curso
        $totalLessons = DB::table('lessons')
            ->join('modules', 'lessons.module_id', '=', 'modules.id')
            ->where('modules.course_id', $courseId)
            ->count();

        $completedLessons = LessonProgress::where('user_id', $request->user()->id)
            ->whereHas('lesson', fn ($q) => $q->whereHas('module', fn ($q2) => $q2->where('course_id', $courseId)))
            ->whereNotNull('completed_at')
            ->count();

        $progress = $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100) : 0;

        $enrollment->update([
            'progress_percent' => $progress,
            'completed_at' => $progress >= 100 ? now() : null,
        ]);

        return response()->json(['progress_percent' => $progress, 'message' => 'Lección completada.']);
    }
}
