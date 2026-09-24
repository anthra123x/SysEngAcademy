<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use App\Models\LearningPath;
use Illuminate\Support\Facades\Cache;

/**
 * Endpoint agregado para la página de inicio: una sola llamada con
 * categorías, rutas y cursos destacados (cacheado) en vez de tres
 * requests que pagaban el arranque en frío de la BD por separado.
 */
class HomeController extends Controller
{
    public function show()
    {
        $payload = Cache::remember('api.home.v1', now()->addMinutes(5), function () {
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
                ->whereNull('learning_path_id')
                ->orderBy('id')
                ->limit(4)
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

        return response()->json($payload);
    }
}
