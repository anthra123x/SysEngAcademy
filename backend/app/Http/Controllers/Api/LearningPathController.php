<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LearningPath;
use Illuminate\Http\Request;

class LearningPathController extends Controller
{
    public function index(Request $request)
    {
        $paths = LearningPath::with(['category'])
            ->withCount('courses')
            ->where('is_published', true)
            ->when($request->category, fn($q, $cat) => $q->whereHas('category', fn($q2) => $q2->where('slug', $cat)))
            ->when($request->difficulty, fn($q, $d) => $q->where('difficulty', $d))
            ->paginate(12);

        return response()->json($paths);
    }

    public function show(string $slug)
    {
        $path = LearningPath::with([
            'category',
            'levels' => fn($q) => $q->orderBy('order'),
            'levels.courses' => fn($q) => $q->where('is_published', true)
                ->with(['category', 'instructor'])->withCount('lessons'),
        ])
        ->withCount('courses')
        ->where('slug', $slug)
        ->where('is_published', true)
        ->firstOrFail();

        return response()->json($path);
    }
}
