<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use App\Models\LearningPath;
use Illuminate\Support\Facades\Cache;

use Illuminate\Http\Request;

/**
 * Endpoint agregado para la página de inicio: una sola llamada con
 * categorías, rutas y cursos destacados (cacheado) en vez de tres
 * requests que pagaban el arranque en frío de la BD por separado.
 */
class HomeController extends Controller
{
    public function show(Request $request)
    {
        $payload = Cache::remember('api.home.v2', now()->addMinutes(5), function () {
            $categories = Category::withCount('courses')->orderBy('name')->get()->toArray();

            $paths = LearningPath::with(['category'])
                ->withCount('courses')
                ->where('is_published', true)
                ->orderBy('id')
                ->get()
                ->toArray();

            $courses = Course::with(['category', 'instructor'])
                ->withCount('lessons')
                ->where('is_published', true)
                ->orderBy('order')
                ->orderBy('id')
                ->limit(6)
                ->get()
                ->toArray();

            // La forma imita las respuestas que ya consume el frontend:
            // rutas y cursos son paginados (data), categorías plano.
            return [
                'categories' => $categories,
                'learning_paths' => ['data' => $paths],
                'courses' => ['data' => $courses],
            ];
        });

        if ($user = $request->user('jwt') ?: $request->user('sanctum')) {
            $enrollments = $user->enrollments()->pluck('progress_percent', 'course_id')->toArray();
            if (isset($payload['courses']['data']) && is_array($payload['courses']['data'])) {
                foreach ($payload['courses']['data'] as &$c) {
                    $cid = $c['id'];
                    $c['enrolled'] = isset($enrollments[$cid]);
                    $c['progress_percent'] = $enrollments[$cid] ?? 0;
                    $c['completed'] = ($enrollments[$cid] ?? 0) >= 100;
                }
                unset($c);
            }
        }

        return response()->json($payload);
    }
}
