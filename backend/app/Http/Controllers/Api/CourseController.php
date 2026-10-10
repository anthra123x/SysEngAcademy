<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $key = 'api.courses.v1.'.md5(json_encode($request->only([
            'search', 'difficulty', 'category', 'is_free', 'learning_path_id', 'independent', 'page',
        ])));

        $data = Cache::remember($key, now()->addMinutes(10), function () use ($request) {
            $courses = Course::with(['category', 'instructor'])
                ->withCount('lessons')
                ->where('is_published', true)
                ->when($request->search, fn ($q, $s) => $q->where('title', 'ilike', "%{$s}%"))
                ->when($request->difficulty, fn ($q, $d) => $q->where('difficulty', $d))
                ->when($request->category, fn ($q, $c) => $q->whereHas('category', fn ($q2) => $q2->where('slug', $c)))
                ->when($request->is_free !== null, fn ($q) => $q->where('is_free', filter_var($request->is_free, FILTER_VALIDATE_BOOLEAN)))
                ->when($request->learning_path_id, fn ($q, $id) => $q->where('learning_path_id', $id))
                ->when(! $request->learning_path_id && $request->boolean('independent'), fn ($q) => $q->whereNull('learning_path_id'))
                ->paginate(16);

            return $courses->toArray();
        });

        if ($user = $request->user('jwt') ?: $request->user('sanctum')) {
            $userEnrollments = $user->enrollments()->pluck('progress_percent', 'course_id')->toArray();
            if (isset($data['data']) && is_array($data['data'])) {
                foreach ($data['data'] as &$c) {
                    $cid = $c['id'];
                    $c['enrolled'] = isset($userEnrollments[$cid]);
                    $c['progress_percent'] = $userEnrollments[$cid] ?? 0;
                    $c['completed'] = ($userEnrollments[$cid] ?? 0) >= 100;
                }
                unset($c);
            }
        }

        return response()->json($data);
    }

    public function show(Request $request, string $slug)
    {
        // Payload público cacheado (contenido estático). El progreso del
        // usuario NO se cachea: se calcula en vivo y se fusiona después.
        $course = Cache::remember("api.course.v1.{$slug}", now()->addMinutes(10), function () use ($slug) {
            return Course::with([
                'category',
                'instructor',
                'learningPath',
                'modules' => fn ($q) => $q->orderBy('order'),
                'modules.lessons' => fn ($q) => $q->orderBy('order')
                    ->select(['id', 'module_id', 'title', 'slug', 'order', 'type', 'duration_minutes', 'is_preview']),
            ])
                ->withCount('lessons')
                ->where('slug', $slug)
                ->where('is_published', true)
                ->firstOrFail()
                ->toArray();
        });

        // Datos específicos del usuario (en vivo, sin cachear)
        if ($user = $request->user('jwt') ?: $request->user('sanctum')) {
            $enrollment = $user->enrollments()
                ->where('course_id', $course['id'])
                ->first();

            $completedLessonIds = $user->lessonProgress()
                ->whereHas('lesson', fn ($q) => $q->whereHas('module', fn ($q2) => $q2->where('course_id', $course['id'])))
                ->whereNotNull('completed_at')
                ->pluck('lesson_id')
                ->toArray();

            $totalLessons = 0;
            foreach ($course['modules'] as &$module) {
                foreach ($module['lessons'] as &$lesson) {
                    $totalLessons++;
                    $lesson['completed'] = in_array($lesson['id'], $completedLessonIds);
                }
                unset($lesson);
            }
            unset($module);

            $realProgress = $totalLessons > 0 ? (int) round((count($completedLessonIds) / $totalLessons) * 100) : 0;
            if ($enrollment && $enrollment->progress_percent !== $realProgress) {
                $enrollment->update([
                    'progress_percent' => $realProgress,
                    'completed_at' => $realProgress >= 100 ? ($enrollment->completed_at ?? now()) : null,
                ]);
            }

            $course['enrolled'] = (bool) $enrollment;
            $course['progress_percent'] = $enrollment ? $enrollment->progress_percent : $realProgress;
            $course['completed'] = ($enrollment && $enrollment->completed_at !== null) || $realProgress >= 100;

            $userReview = \App\Models\CourseReview::where('course_id', $course['id'])
                ->where('user_id', $user->id)
                ->first();
            $course['user_review'] = $userReview;
        }

        return response()->json($course);
    }
}
