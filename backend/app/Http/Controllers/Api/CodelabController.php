<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CodelabChallenge;
use App\Models\CodelabComment;
use App\Models\CodelabSubmission;
use App\Models\CodelabVote;
use App\Models\User;
use App\Services\AiCodelabChallengeService;
use App\Services\CodelabService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CodelabController extends Controller
{
    public function __construct(
        protected CodelabService $codelabService
    ) {}

    /**
     * List all challenges with filters, search, and tab counters.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        $userId = $user?->id;
        $ip = $request->ip();

        $query = CodelabChallenge::query()->withCount('testCases');

        // Tab filter
        $tab = $request->query('tab', 'todos');
        if ($tab === 'oficiales') {
            $query->where('is_official', true);
        } elseif ($tab === 'comunidad') {
            $query->where('is_community', true);
        } elseif ($tab === 'mis_retos') {
            if ($userId) {
                $query->where('user_id', $userId);
            } else {
                $query->whereRaw('1 = 0');
            }
        } elseif ($tab === 'mis_soluciones') {
            if ($userId) {
                $solvedIds = CodelabSubmission::where('user_id', $userId)
                    ->where('status', 'passed')
                    ->pluck('challenge_id');
                $query->whereIn('id', $solvedIds);
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        // Difficulty filter
        if ($diff = $request->query('difficulty')) {
            $query->where('difficulty', $diff);
        }

        // Category filter
        if ($cat = $request->query('category')) {
            $query->where('category', $cat);
        }

        // Academic track filter (Semesters)
        if ($track = $request->query('track')) {
            if ($track === 'sem1-3') {
                $query->whereIn('category', ['algoritmos', 'estructuras']);
            } elseif ($track === 'sem4-7') {
                $query->whereIn('category', ['concurrencia', 'so', 'bd']);
            } elseif ($track === 'sem8-10') {
                $query->whereIn('category', ['compiladores', 'distribuidos']);
            }
        }

        // Language filter
        if ($lang = $request->query('language')) {
            $query->where(function ($q) use ($lang) {
                $q->whereJsonContains('languages', $lang)
                  ->orWhere('languages', 'ILIKE', "%{$lang}%");
            });
        }

        // Search text
        if ($q = $request->query('q')) {
            $term = strtolower(trim($q));
            $query->where(function ($sq) use ($term) {
                $sq->whereRaw('LOWER(title) LIKE ?', ["%{$term}%"])
                   ->orWhereRaw('LOWER(description) LIKE ?', ["%{$term}%"])
                   ->orWhereRaw('LOWER(author_username) LIKE ?', ["%{$term}%"]);
            });
        }

        // Order
        $query->orderBy('is_spotlight', 'desc')
              ->orderBy('upvotes', 'desc')
              ->orderBy('created_at', 'desc');

        // Pre-fetch votes and passed submissions in 2 batch queries to eliminate N+1 problem
        $userVotes = $userId
            ? CodelabVote::where('user_id', $userId)->pluck('challenge_id')->flip()->all()
            : CodelabVote::where('ip_address', $ip)->pluck('challenge_id')->flip()->all();

        $userSolved = $userId
            ? CodelabSubmission::where('user_id', $userId)->where('status', 'passed')->pluck('challenge_id')->flip()->all()
            : [];

        $challenges = $query->get()->map(function ($c) use ($userId, $userVotes, $userSolved) {
            $voted = isset($userVotes[$c->id]);
            $isCurrentUser = (bool) ($userId && $c->user_id === $userId);

            $status = 'pending';
            if ($isCurrentUser) {
                $status = 'my_creation';
            } elseif (isset($userSolved[$c->id])) {
                $status = 'solved';
            }

            return [
                'id'              => (string) $c->id,
                'slug'            => $c->slug,
                'title'           => $c->title,
                'description'     => $c->description,
                'difficulty'      => $c->difficulty,
                'acceptanceRate'  => (float) $c->acceptance_rate,
                'xp'              => (int) $c->xp,
                'category'        => $c->category,
                'tags'            => $c->tags ?? [],
                'languages'       => $c->languages ?? [],
                'author' => [
                    'name'             => $c->author_name,
                    'username'         => $c->author_username,
                    'role'             => $c->author_role,
                    'avatarInitial'    => $c->author_avatar ?? strtoupper(substr($c->author_name, 0, 1)),
                    'isOfficial'       => (bool) $c->is_official,
                    'isCurrentUser'    => $isCurrentUser,
                    'isTopContributor' => $c->upvotes > 150,
                    'isMonitor'        => str_contains(strtolower($c->author_role), 'monitor'),
                    'isAi'             => $c->author_username === 'byte_ai' || str_contains(strtolower($c->author_role), 'ia'),
                ],
                'status'          => $status,
                'upvotes'         => (int) $c->upvotes,
                'commentsCount'   => (int) $c->comments_count,
                'userVoted'       => $voted,
                'isOfficial'      => (bool) $c->is_official,
                'isCommunity'     => (bool) $c->is_community,
                'isSpotlight'     => (bool) $c->is_spotlight,
                'testCasesCount'  => $c->test_cases_count,
                'solutionPreview' => $c->solution_preview,
                'starterCode'     => $c->starter_code ?? [],
                'publishedAt'     => $c->created_at->diffForHumans(),
            ];
        });

        // Tab counts
        $allCount = CodelabChallenge::count();
        $officialCount = CodelabChallenge::where('is_official', true)->count();
        $communityCount = CodelabChallenge::where('is_community', true)->count();
        $myCount = $userId ? CodelabChallenge::where('user_id', $userId)->count() : 0;
        $solvedCount = $userId ? CodelabSubmission::where('user_id', $userId)->where('status', 'passed')->distinct('challenge_id')->count('challenge_id') : 0;

        // Spotlight
        $spotlight = $challenges->firstWhere('isSpotlight', true) ?? $challenges->first();

        return response()->json([
            'challenges' => $challenges,
            'spotlight'  => $spotlight,
            'tabCounts'  => [
                'todos'          => $allCount,
                'oficiales'      => $officialCount,
                'comunidad'      => $communityCount,
                'mis_retos'      => $myCount,
                'mis_soluciones' => $solvedCount,
            ],
            'stats'      => $this->codelabService->computeStats($user),
        ]);
    }

    /**
     * Get a single challenge by slug with its test cases.
     */
    public function show(string $slug, Request $request): JsonResponse
    {
        $challenge = CodelabChallenge::where('slug', $slug)
            ->orWhere('id', is_numeric($slug) ? $slug : 0)
            ->with(['testCases' => fn ($q) => $q->orderBy('order')])
            ->first();

        if (!$challenge) {
            throw new ModelNotFoundException("Challenge not found: {$slug}");
        }

        $user = $this->resolveUser($request);
        $userId = $user?->id;
        $ip = $request->ip();

        $voted = false;
        if ($userId) {
            $voted = CodelabVote::where('challenge_id', $challenge->id)->where('user_id', $userId)->exists();
        } else {
            $voted = CodelabVote::where('challenge_id', $challenge->id)->where('ip_address', $ip)->exists();
        }

        return response()->json([
            'id'              => (string) $challenge->id,
            'slug'            => $challenge->slug,
            'title'           => $challenge->title,
            'description'     => $challenge->description,
            'difficulty'      => $challenge->difficulty,
            'acceptanceRate'  => (float) $challenge->acceptance_rate,
            'xp'              => (int) $challenge->xp,
            'category'        => $challenge->category,
            'tags'            => $challenge->tags ?? [],
            'languages'       => $challenge->languages ?? [],
            'author' => [
                'name'          => $challenge->author_name,
                'username'      => $challenge->author_username,
                'role'          => $challenge->author_role,
                'avatarInitial' => $challenge->author_avatar ?? strtoupper(substr($challenge->author_name, 0, 1)),
                'isOfficial'    => (bool) $challenge->is_official,
                'isCurrentUser' => (bool) ($userId && $challenge->user_id === $userId),
            ],
            'upvotes'         => (int) $challenge->upvotes,
            'commentsCount'   => (int) $challenge->comments_count,
            'userVoted'       => $voted,
            'isOfficial'      => (bool) $challenge->is_official,
            'isCommunity'     => (bool) $challenge->is_community,
            'starterCode'     => $challenge->starter_code ?? [],
            'solutionPreview' => $challenge->solution_preview,
            'testCases'       => $challenge->testCases->map(fn ($tc) => [
                'id'       => $tc->id,
                'input'    => $tc->input,
                'expected' => $tc->expected_output,
                'isHidden' => (bool) $tc->is_hidden,
                'label'    => $tc->label,
            ]),
        ]);
    }

    /**
     * Store a new community challenge.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'           => 'required|string|min:5|max:180',
            'description'     => 'required|string|min:15',
            'difficulty'      => 'required|in:facil,media,dificil,hardcore',
            'category'        => 'required|in:algoritmos,estructuras,concurrencia,so,bd,compiladores',
            'inputStdin'      => 'nullable|string',
            'expectedStdout'  => 'required|string',
            'starterCode'     => 'nullable|string',
            'solutionPreview' => 'nullable|string',
            'tags'            => 'nullable|array',
            'languages'       => 'nullable|array',
        ]);

        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $challenge = $this->codelabService->createChallenge($user, $validated);

        return response()->json([
            'message'   => 'Reto de la comunidad publicado exitosamente',
            'challenge' => [
                'id'          => (string) $challenge->id,
                'slug'        => $challenge->slug,
                'title'       => $challenge->title,
                'difficulty'  => $challenge->difficulty,
                'xp'          => (int) $challenge->xp,
                'author_role' => $challenge->author_role,
            ],
        ], 201);
    }

    /**
     * Toggle upvote on a challenge.
     */
    public function vote(string|int $id, Request $request): JsonResponse
    {
        $challenge = $this->resolveChallenge($id);
        $user = $this->resolveUser($request);
        $userId = $user?->id;
        $ip = $request->ip();

        $result = $this->codelabService->toggleVote($challenge, $userId, $ip);

        return response()->json($result);
    }

    /**
     * Get comments for a challenge.
     */
    public function getComments(string|int $id): JsonResponse
    {
        $challenge = $this->resolveChallenge($id);
        $comments = CodelabComment::where('challenge_id', $challenge->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($c) => [
                'id'          => (string) $c->id,
                'challengeId' => (string) $challenge->id,
                'author' => [
                    'name'          => $c->author_name,
                    'username'      => $c->author_username,
                    'role'          => $c->author_role,
                    'avatarInitial' => $c->author_avatar,
                    'isAi'          => (bool) $c->is_ai,
                ],
                'content'     => $c->content,
                'codeSnippet' => $c->code_snippet,
                'upvotes'     => (int) $c->upvotes,
                'createdAt'   => $c->created_at->diffForHumans(),
            ]);

        return response()->json($comments);
    }

    /**
     * Post a comment on a challenge.
     */
    public function storeComment(string|int $id, Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'content'     => 'required|string|min:3|max:1000',
            'codeSnippet' => 'nullable|string|max:8192',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $challenge = $this->resolveChallenge($id);
        $user = $this->resolveUser($request);

        $authorName = $user?->name ?? 'Estudiante';
        $authorUsername = $user ? Str::slug($user->name, '_') : "user_{$user?->id}";
        $authorRole = in_array($user?->role, ['admin', 'instructor', 'teacher']) ? 'Docente SysEng' : 'Estudiante SysEng';
        $authorAvatar = strtoupper(substr($authorName, 0, 1));

        $comment = CodelabComment::create([
            'challenge_id'    => $challenge->id,
            'user_id'         => $user?->id,
            'author_name'     => $authorName,
            'author_username' => $authorUsername,
            'author_role'     => $authorRole,
            'author_avatar'   => $authorAvatar,
            'is_ai'           => false,
            'content'         => $request->input('content'),
            'code_snippet'    => $request->input('codeSnippet'),
            'upvotes'         => 0,
        ]);

        $challenge->increment('comments_count');

        if ($user) {
            $user->increment('xp', 15);
        }

        return response()->json([
            'message' => 'Comentario publicado exitosamente',
            'comment' => [
                'id'          => (string) $comment->id,
                'challengeId' => (string) $challenge->id,
                'author' => [
                    'name'          => $comment->author_name,
                    'username'      => $comment->author_username,
                    'role'          => $comment->author_role,
                    'avatarInitial' => $comment->author_avatar,
                    'isAi'          => false,
                ],
                'content'     => $comment->content,
                'codeSnippet' => $comment->code_snippet,
                'upvotes'     => 0,
                'createdAt'   => 'Hace un momento',
            ],
            'commentsCount' => $challenge->fresh()->comments_count,
        ], 201);
    }

    /**
     * Submit a solution for evaluation against all test cases.
     */
    public function submit(string|int $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'language' => 'required|string',
            'code'     => 'required|string|max:65536',
        ]);

        $challenge = $this->resolveChallenge($id);
        $user = $this->resolveUser($request);

        $result = $this->codelabService->evaluateSubmission(
            challenge: $challenge,
            user: $user,
            lang: $validated['language'],
            code: $validated['code']
        );

        return response()->json($result);
    }

    /**
     * Real-time metrics
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        return response()->json($this->codelabService->computeStats($user));
    }

    /**
     * Server-Sent Events (SSE) stream for live telemetry, podium, and activity feed.
     */
    public function stream(Request $request)
    {
        $user = $this->resolveUser($request);

        return response()->stream(function () use ($user) {
            $data = $this->codelabService->computeStats($user);
            echo "data: " . json_encode($data) . "\n\n";
            ob_flush();
            flush();
        }, 200, [
            'Content-Type'      => 'text/event-stream',
            'Cache-Control'     => 'no-cache',
            'Connection'        => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /**
     * Endpoint API para generar retos bajo demanda con el Agente Byte AI.
     */
    public function generateAiChallenge(Request $request, AiCodelabChallengeService $aiService): JsonResponse
    {
        $count = min(max((int) $request->input('count', 1), 1), 5);
        $challenges = $aiService->generateMultipleChallenges($count);

        return response()->json([
            'message'    => 'Desafíos generados exitosamente por Byte AI',
            'count'      => count($challenges),
            'challenges' => $challenges,
        ]);
    }

    /**
     * Resuelve el desafío garantizando que un ID inexistente retorne 404.
     */
    private function resolveChallenge(string|int $id): CodelabChallenge
    {
        if (is_numeric($id)) {
            $c = CodelabChallenge::with('testCases')->find($id);
            if ($c) return $c;
        }

        $c = CodelabChallenge::with('testCases')->where('slug', $id)->first();
        if ($c) return $c;

        if (preg_match('/(\d+)/', (string) $id, $m)) {
            $c = CodelabChallenge::with('testCases')->find($m[1]);
            if ($c) return $c;
        }

        throw new ModelNotFoundException("Challenge not found for: {$id}");
    }

    private function resolveUser(Request $request): ?User
    {
        return $request->user('jwt') ?: $request->user('sanctum') ?: $request->user();
    }
}
