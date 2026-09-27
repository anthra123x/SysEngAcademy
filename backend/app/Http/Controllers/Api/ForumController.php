<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\ForumPost;
use App\Models\ForumReply;
use Illuminate\Http\Request;

class ForumController extends Controller
{
    public function index(Request $request, string $courseSlug)
    {
        $course = Course::where('slug', $courseSlug)->firstOrFail();

        $posts = ForumPost::with([
            'user:id,name,role,avatar',
            'module:id,title,order',
            'lesson:id,title,slug,order,type',
        ])
            ->withCount('replies')
            ->where('course_id', $course->id)
            ->when($request->module_id, fn ($q, $mid) => $q->where('module_id', $mid))
            ->when($request->lesson_id, fn ($q, $lid) => $q->where('lesson_id', $lid))
            ->when($request->category, fn ($q, $cat) => $q->where('category', $cat))
            ->when($request->search, function ($q, $s) {
                $q->where(function ($sub) use ($s) {
                    $sub->where('title', 'ilike', "%{$s}%")
                        ->orWhere('content', 'ilike', "%{$s}%");
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($posts);
    }

    public function store(Request $request, string $courseSlug)
    {
        $course = Course::where('slug', $courseSlug)->firstOrFail();

        $validated = $request->validate([
            'title'     => 'required|string|min:4|max:255',
            'content'   => 'required|string|min:10',
            'category'  => 'nullable|string|in:question,solution,exam,discussion',
            'module_id' => 'nullable|integer|exists:modules,id',
            'lesson_id' => 'nullable|integer|exists:lessons,id',
        ]);

        $post = ForumPost::create([
            'user_id'   => $request->user()->id,
            'course_id' => $course->id,
            'module_id' => $validated['module_id'] ?? null,
            'lesson_id' => $validated['lesson_id'] ?? null,
            'title'     => $validated['title'],
            'content'   => $validated['content'],
            'category'  => $validated['category'] ?? 'question',
            'upvotes'   => 0,
            'is_solved' => false,
        ]);

        $post->load(['user:id,name,role,avatar', 'module:id,title,order', 'lesson:id,title,slug,order,type']);
        $post->replies_count = 0;

        return response()->json($post, 201);
    }

    public function show(int $id)
    {
        $post = ForumPost::with([
            'user:id,name,role,avatar',
            'course:id,title,slug',
            'module:id,title,order',
            'lesson:id,title,slug,order,type',
            'replies.user:id,name,role,avatar',
        ])
            ->withCount('replies')
            ->findOrFail($id);

        return response()->json($post);
    }

    public function storeReply(Request $request, int $id)
    {
        $post = ForumPost::findOrFail($id);

        $validated = $request->validate([
            'content' => 'required|string|min:3',
        ]);

        $reply = ForumReply::create([
            'post_id'     => $post->id,
            'user_id'     => $request->user()->id,
            'content'     => $validated['content'],
            'is_solution' => false,
            'upvotes'     => 0,
        ]);

        $reply->load('user:id,name,role,avatar');

        return response()->json($reply, 201);
    }

    public function upvotePost(Request $request, int $id)
    {
        $post = ForumPost::findOrFail($id);
        $post->increment('upvotes');

        return response()->json(['upvotes' => $post->upvotes]);
    }

    public function markSolution(Request $request, int $replyId)
    {
        $reply = ForumReply::with('post')->findOrFail($replyId);
        $user = $request->user();

        // Solo el autor del post o un instructor/admin puede marcar solución
        if ($reply->post->user_id !== $user->id && $user->role !== 'instructor' && $user->role !== 'admin') {
            return response()->json(['message' => 'No autorizado para marcar solución'], 403);
        }

        // Desmarcar otras soluciones del mismo post
        ForumReply::where('post_id', $reply->post_id)->update(['is_solution' => false]);

        $reply->update(['is_solution' => true]);
        $reply->post->update(['is_solved' => true]);

        return response()->json($reply);
    }
}
