<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LearningPath;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class LearningPathController extends Controller
{
    public function index(Request $request)
    {
        $key = 'api.paths.v1.'.md5(json_encode($request->only(['category', 'difficulty', 'page'])));

        $data = Cache::remember($key, now()->addMinutes(10), function () use ($request) {
            $paths = LearningPath::with(['category'])
                ->withCount('courses')
                ->where('is_published', true)
                ->when($request->category, fn ($q, $cat) => $q->whereHas('category', fn ($q2) => $q2->where('slug', $cat)))
                ->when($request->difficulty, fn ($q, $d) => $q->where('difficulty', $d))
                ->paginate(12);

            return $paths->toArray();
        });

        return response()->json($data);
    }

    public function show(string $slug)
    {
        $path = Cache::remember("api.path.v1.{$slug}", now()->addMinutes(10), function () use ($slug) {
            return LearningPath::with([
                'category',
                'levels' => fn ($q) => $q->orderBy('order'),
                'levels.courses' => fn ($q) => $q->where('is_published', true)
                    ->with(['category', 'instructor'])
                    ->withCount('lessons'),
            ])
                ->withCount('courses')
                ->where('slug', $slug)
                ->where('is_published', true)
                ->firstOrFail()
                ->toArray();
        });

        return response()->json($path);
    }
}
