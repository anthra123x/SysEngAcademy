<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CourseReviewController extends Controller
{
    /**
     * Obtener estadísticas y listado de reseñas de un curso.
     */
    public function index(Request $request, string $slug)
    {
        $course = Course::where('slug', $slug)->firstOrFail();

        // Desglose de estrellas (1 a 5)
        $breakdown = [
            5 => CourseReview::where('course_id', $course->id)->where('rating', 5)->count(),
            4 => CourseReview::where('course_id', $course->id)->where('rating', 4)->count(),
            3 => CourseReview::where('course_id', $course->id)->where('rating', 3)->count(),
            2 => CourseReview::where('course_id', $course->id)->where('rating', 2)->count(),
            1 => CourseReview::where('course_id', $course->id)->where('rating', 1)->count(),
        ];

        $reviews = CourseReview::with(['user:id,name,avatar,role'])
            ->where('course_id', $course->id)
            ->latest()
            ->paginate(15);

        // Si el usuario está autenticado, identificar su reseña previa
        $userReview = null;
        if ($user = $request->user('jwt') ?: $request->user('sanctum')) {
            $userReview = CourseReview::where('course_id', $course->id)
                ->where('user_id', $user->id)
                ->first();
        }

        return response()->json([
            'stats' => [
                'average' => (float) ($course->rating_avg ?? 5.0),
                'total' => (int) ($course->rating_count ?? 0),
                'breakdown' => $breakdown,
            ],
            'reviews' => $reviews,
            'user_review' => $userReview,
        ]);
    }

    /**
     * Calificar un curso (crear o actualizar reseña del estudiante).
     */
    public function store(Request $request, string $slug)
    {
        $user = $request->user('jwt') ?: $request->user('sanctum');
        if (! $user) {
            return response()->json(['message' => 'No autorizado. Debes iniciar sesión para calificar.'], 401);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1500',
        ]);

        $course = Course::where('slug', $slug)->firstOrFail();

        $review = CourseReview::updateOrCreate(
            [
                'course_id' => $course->id,
                'user_id' => $user->id,
            ],
            [
                'rating' => $validated['rating'],
                'comment' => $validated['comment'] ?? null,
            ]
        );

        // Recalcular métricas de curso
        $course->recalculateRating();
        $course->refresh();

        // Limpiar cachés relacionadas
        Cache::forget("api.course.v1.{$course->slug}");
        Cache::forget('api.home.v2');

        return response()->json([
            'message' => '¡Tu calificación ha sido guardada exitosamente!',
            'review' => $review->load('user:id,name,avatar,role'),
            'rating_avg' => (float) $course->rating_avg,
            'rating_count' => (int) $course->rating_count,
        ]);
    }

    /**
     * Eliminar la reseña del estudiante.
     */
    public function destroy(Request $request, string $slug)
    {
        $user = $request->user('jwt') ?: $request->user('sanctum');
        if (! $user) {
            return response()->json(['message' => 'No autorizado.'], 401);
        }

        $course = Course::where('slug', $slug)->firstOrFail();

        $deleted = CourseReview::where('course_id', $course->id)
            ->where('user_id', $user->id)
            ->delete();

        if ($deleted) {
            $course->recalculateRating();
            $course->refresh();
            Cache::forget("api.course.v1.{$course->slug}");
            Cache::forget('api.home.v2');
        }

        return response()->json([
            'message' => 'Calificación eliminada correctamente.',
            'rating_avg' => (float) $course->rating_avg,
            'rating_count' => (int) $course->rating_count,
        ]);
    }
}
