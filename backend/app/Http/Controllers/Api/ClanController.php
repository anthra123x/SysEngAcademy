<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Clan;
use App\Models\ClanMember;
use App\Models\ClanPost;
use App\Models\ClanPostComment;
use App\Models\ClanPostUpvote;
use App\Models\ClanProject;
use App\Models\ClanProjectCommit;
use App\Models\ClanProjectPullRequest;
use App\Models\ClanProjectTask;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ClanController extends Controller
{
    /**
     * Lista los clanes con miembros, proyectos, kanban y telemetría de racha.
     */
    public function index(Request $request): JsonResponse
    {
        $this->ensureWorkflowSeeded();

        $user = $this->resolveUser($request);
        $currentUserId = $user?->id;

        $clans = Clan::with([
            'members.user',
            'posts.user',
            'posts.comments.user',
            'posts.upvotes',
            'projects.tasks',
            'projects.pullRequests',
            'projects.commits',
        ])->get();

        $data = $clans->map(fn (Clan $clan) => $this->formatClan($clan, $currentUserId));

        return response()->json($data);
    }

    /**
     * Retorna el detalle completo de un clan específico.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $this->resolveUser($request);
        $currentUserId = $user?->id;

        $clan = Clan::with([
            'members.user',
            'posts.user',
            'posts.comments.user',
            'posts.upvotes',
            'projects.tasks',
            'projects.pullRequests',
            'projects.commits',
        ])->findOrFail($id);

        return response()->json($this->formatClan($clan, $currentUserId));
    }

    /**
     * Unirse a un clan de investigación.
     */
    public function join(Request $request, string $id): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $clan = Clan::findOrFail($id);

        // Desvincular de otros clanes y registrar en el actual
        ClanMember::where('user_id', $user->id)->delete();

        ClanMember::create([
            'clan_id'   => $clan->id,
            'user_id'   => $user->id,
            'role'      => 'Cadete Investigador',
            'joined_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Te has unido exitosamente al semillero {$clan->name}",
            'clanId'  => $clan->id,
        ]);
    }

    /**
     * Abandonar un clan.
     */
    public function leave(Request $request, string $id): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        ClanMember::where('clan_id', $id)
            ->where('user_id', $user->id)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Has salido del clan',
            'clanId'  => $id,
        ]);
    }

    /**
     * Crear una nueva tarea / issue en el tablero Kanban del Sprint.
     */
    public function storeProjectTask(Request $request, string $clanId, string $projectId): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type'        => 'nullable|string|in:feature,bug,perf,security,arch',
            'assigned_to' => 'nullable|string|max:100',
            'xp_reward'   => 'nullable|integer|min:10|max:200',
        ]);

        $project = ClanProject::where('clan_id', $clanId)->findOrFail($projectId);
        $taskId = 'tk_' . substr(md5(uniqid(rand(), true)), 0, 8);

        $task = ClanProjectTask::create([
            'id'          => $taskId,
            'project_id'  => $project->id,
            'clan_id'     => $clanId,
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status'      => 'pending',
            'type'        => $validated['type'] ?? 'feature',
            'assigned_to' => $validated['assigned_to'] ?? null,
            'xp_reward'   => $validated['xp_reward'] ?? 45,
            'completed'   => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Issue #{$task->id} creado exitosamente en Backlog",
            'task'    => [
                'id'         => $task->id,
                'title'      => $task->title,
                'status'     => $task->status,
                'type'       => $task->type,
                'assignedTo' => $task->assigned_to,
                'completed'  => $task->completed,
                'xpReward'   => $task->xp_reward,
            ],
        ], 201);
    }

    /**
     * Actualiza el estado de una tarea (Drag & Drop en Kanban).
     */
    public function updateProjectTaskStatus(Request $request, string $clanId, string $projectId, string $taskId): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:pending,in_progress,review,completed',
        ]);

        $task = ClanProjectTask::where('project_id', $projectId)
            ->where('clan_id', $clanId)
            ->findOrFail($taskId);

        $prevStatus = $task->status;
        $nextStatus = $validated['status'];

        $task->status = $nextStatus;
        $task->completed = ($nextStatus === 'completed');

        // Asignar automáticamente al usuario si no tenía asignado
        if (!$task->assigned_to && $nextStatus !== 'pending') {
            $task->assigned_to = $user->name;
        }

        $task->save();

        // Recompensa de XP por avance
        $xpAwarded = 0;
        if ($nextStatus === 'completed' && $prevStatus !== 'completed') {
            $xpAwarded = $task->xp_reward ?: 45;
            $user->increment('xp', $xpAwarded);
        } elseif ($nextStatus === 'in_progress' && $prevStatus === 'pending') {
            $xpAwarded = 10;
            $user->increment('xp', $xpAwarded);
        }

        return response()->json([
            'success'   => true,
            'message'   => "Estado de #{$task->id} actualizado a {$nextStatus}",
            'xpAwarded' => $xpAwarded,
            'task'      => [
                'id'         => $task->id,
                'title'      => $task->title,
                'status'     => $task->status,
                'type'       => $task->type,
                'assignedTo' => $task->assigned_to,
                'completed'  => $task->completed,
                'xpReward'   => $task->xp_reward,
            ],
        ]);
    }

    /**
     * Asignar tarea al usuario actual o a un compañero.
     */
    public function assignProjectTask(Request $request, string $clanId, string $projectId, string $taskId): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $task = ClanProjectTask::where('project_id', $projectId)
            ->where('clan_id', $clanId)
            ->findOrFail($taskId);

        $assignee = $request->input('assigned_to') ?: $user->name;
        $task->assigned_to = $assignee;
        $task->save();

        return response()->json([
            'success' => true,
            'message' => "Tarea #{$task->id} asignada a {$assignee}",
            'task'    => [
                'id'         => $task->id,
                'assignedTo' => $task->assigned_to,
            ],
        ]);
    }

    /**
     * Crear un Pull Request con Vercel Preview Deployment automático.
     */
    public function storeProjectPullRequest(Request $request, string $clanId, string $projectId): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $validated = $request->validate([
            'title'           => 'required|string|max:255',
            'description'     => 'nullable|string|max:2000',
            'source_branch'   => 'required|string|max:100',
            'target_branch'   => 'nullable|string|max:100',
            'filename'        => 'nullable|string|max:100',
            'code_snippet'    => 'nullable|string',
            'linked_issue_id' => 'nullable|string',
        ]);

        $project = ClanProject::where('clan_id', $clanId)->findOrFail($projectId);

        $nextNumber = (ClanProjectPullRequest::where('project_id', $project->id)->max('number') ?? 0) + 1;
        $prId = 'pr_' . substr(md5(uniqid(rand(), true)), 0, 8);

        $slugBranch = Str::slug(str_replace('/', '-', $validated['source_branch']));
        $previewUrl = "https://syseng-kernel-git-{$slugBranch}.vercel.app";

        $diffLines = array_filter(explode("\n", $validated['code_snippet'] ?? ''));
        $additions = array_map(fn ($l) => str_starts_with($l, '+') ? $l : '+ ' . $l, $diffLines);

        $pr = ClanProjectPullRequest::create([
            'id'              => $prId,
            'project_id'      => $project->id,
            'clan_id'         => $clanId,
            'number'          => $nextNumber,
            'title'           => $validated['title'],
            'description'     => $validated['description'] ?? 'Implementación validada en preview.',
            'source_branch'   => $validated['source_branch'],
            'target_branch'   => $validated['target_branch'] ?? 'main',
            'status'          => 'open',
            'ci_status'       => 'passed',
            'author'          => $user->name,
            'author_role'     => $user->role === 'teacher' ? 'Docente Cátedra' : 'Cadete Investigador',
            'preview_url'     => $previewUrl,
            'build_duration'  => rand(18, 32) . 's',
            'code_diff'       => [
                'filename'  => $validated['filename'] ?? 'kernel/main.cpp',
                'additions' => count($additions) > 0 ? $additions : ['+ // Cambios implementados en PR #' . $nextNumber],
                'deletions' => ['- // Implementación anterior'],
            ],
            'reviews'         => [],
            'xp_reward'       => 90,
            'linked_issue_id' => $validated['linked_issue_id'] ?? null,
        ]);

        // Si vinculó un issue, moverlo a review
        if (!empty($validated['linked_issue_id'])) {
            ClanProjectTask::where('project_id', $project->id)
                ->where('id', $validated['linked_issue_id'])
                ->update(['status' => 'review']);
        }

        return response()->json([
            'success' => true,
            'message' => "Pull Request #{$pr->number} abierto. Entorno de prueba Vercel generado.",
            'pr'      => $this->formatPullRequest($pr),
        ], 201);
    }

    /**
     * Enviar revisión técnica (Code Review / LGTM / Cambios Solicitados).
     */
    public function reviewProjectPullRequest(Request $request, string $clanId, string $projectId, string $prId): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $validated = $request->validate([
            'verdict' => 'required|string|in:approved,changes_requested,comment',
            'comment' => 'required|string|max:1000',
        ]);

        $pr = ClanProjectPullRequest::where('project_id', $projectId)
            ->where('clan_id', $clanId)
            ->findOrFail($prId);

        $reviews = $pr->reviews ?: [];
        $isTeacher = ($user->role === 'teacher');

        $reviews[] = [
            'reviewer'  => $user->name,
            'isTeacher' => $isTeacher,
            'verdict'   => $validated['verdict'],
            'comment'   => ($isTeacher && $validated['verdict'] === 'approved' ? 'Aval de Cátedra: ' : '') . $validated['comment'],
            'timeAgo'   => 'hace un momento',
            'createdAt' => now()->toIso8601String(),
        ];

        $pr->reviews = $reviews;
        $pr->save();

        return response()->json([
            'success' => true,
            'message' => 'Revisión técnica registrada con éxito',
            'pr'      => $this->formatPullRequest($pr),
        ]);
    }

    /**
     * Fusión 1-clic a main y despliegue a Producción Vercel.
     */
    public function mergeProjectPullRequest(Request $request, string $clanId, string $projectId, string $prId): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $project = ClanProject::where('clan_id', $clanId)->findOrFail($projectId);
        $pr = ClanProjectPullRequest::where('project_id', $project->id)->findOrFail($prId);

        if ($pr->status === 'merged') {
            return response()->json(['error' => 'Este PR ya fue fusionado anteriormente'], 422);
        }

        $newCommitHash = substr(md5(uniqid(rand(), true)), 0, 7);

        DB::transaction(function () use ($project, $pr, $user, $newCommitHash, $clanId) {
            // 1. Marcar PR como fusionado
            $pr->status = 'merged';
            $pr->merged_at = 'hace un momento';
            $pr->merged_by = $user->name;
            $pr->save();

            // 2. Crear commit en historial
            ClanProjectCommit::create([
                'id'         => 'cmt_' . $newCommitHash,
                'project_id' => $project->id,
                'clan_id'    => $clanId,
                'hash'       => $newCommitHash,
                'message'    => "Merge PR #{$pr->number}: {$pr->title}",
                'author'     => $user->name,
                'branch'     => 'main',
                'time_ago'   => 'hace un momento',
            ]);

            // 3. Actualizar entorno de producción
            $project->production_deployment = [
                'domain'        => $project->production_deployment['domain'] ?? 'https://syseng-kernel.vercel.app',
                'status'        => 'ready',
                'commitHash'    => $newCommitHash,
                'commitMessage' => "Merge PR #{$pr->number}: {$pr->title}",
                'branch'        => 'main',
                'deployedAt'    => "hace un momento por {$user->name}",
            ];
            $project->save();

            // 4. Si tenía issue vinculado, marcar como completado
            if ($pr->linked_issue_id) {
                ClanProjectTask::where('project_id', $project->id)
                    ->where('id', $pr->linked_issue_id)
                    ->update([
                        'status'    => 'completed',
                        'completed' => true,
                    ]);
            }

            // 5. Otorgar XP al autor del merge
            $user->increment('xp', 90);
        });

        return response()->json([
            'success'              => true,
            'message'              => "Pull Request #{$pr->number} fusionado. Producción actualizada a commit {$newCommitHash} (+90 XP).",
            'pr'                   => $this->formatPullRequest($pr->fresh()),
            'productionDeployment' => $project->fresh()->production_deployment,
        ]);
    }

    /**
     * Avalar publicación RFC/ADR con el Sello Docente de Cátedra (+80 XP).
     */
    public function endorsePost(Request $request, string $clanId, int $postId): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $validated = $request->validate([
            'note' => 'required|string|max:500',
        ]);

        $post = ClanPost::where('clan_id', $clanId)->findOrFail($postId);

        $post->teacher_endorsement = [
            'teacherName' => $user->name,
            'note'        => $validated['note'],
            'date'        => 'hace un momento',
            'xpAwarded'   => 80,
        ];
        $post->save();

        // Premiar al autor del post
        $author = $post->user;
        if ($author) {
            $author->increment('xp', 80);
        }

        return response()->json([
            'success'            => true,
            'message'            => "Aval de Cátedra concedido al RFC (+80 XP para {$author?->name}).",
            'teacherEndorsement' => $post->teacher_endorsement,
        ]);
    }

    /**
     * Resolver o avanzar un Simulacro de Fallos en Producción (Incident Drill).
     */
    public function resolveDrill(Request $request, string $clanId): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $clan = Clan::findOrFail($clanId);
        $quest = $clan->weekly_quest;

        if ($quest) {
            $quest['completed'] = true;
            $quest['currentCount'] = $quest['targetCount'] ?? 3;
            $clan->weekly_quest = $quest;
            $clan->increment('current_xp', $quest['xpReward'] ?? 450);
            $clan->save();

            $user->increment('xp', 150);
        }

        return response()->json([
            'success'     => true,
            'message'     => 'Simulacro de Incidencia resuelto con éxito (+150 XP para el operador)',
            'weeklyQuest' => $clan->weekly_quest,
        ]);
    }

    /**
     * Publicar un post / reto / RFC en el clan.
     */
    public function storePost(Request $request, string $clanId): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'content'       => 'required|string',
            'type'          => 'nullable|string|in:discusion,hallazgo,reto,benchmark,propuesta,paper,standup,mision_docente',
            'code_snippet'  => 'nullable|string',
            'code_language' => 'nullable|string|max:30',
        ]);

        $clan = Clan::findOrFail($clanId);

        ClanMember::firstOrCreate(
            ['clan_id' => $clan->id, 'user_id' => $user->id],
            ['role' => $user->role === 'teacher' ? 'Director Cátedra' : 'Cadete Investigador', 'joined_at' => now()]
        );

        $post = ClanPost::create([
            'clan_id'       => $clan->id,
            'user_id'       => $user->id,
            'author_role'   => $user->role === 'teacher' ? 'Docente de Cátedra' : 'Cadete Investigador',
            'title'         => $validated['title'],
            'content'       => $validated['content'],
            'type'          => $validated['type'] ?? 'propuesta',
            'code_snippet'  => $validated['code_snippet'] ?? null,
            'code_language' => $validated['code_language'] ?? null,
            'upvotes_count' => 1,
        ]);

        ClanPostUpvote::create([
            'post_id' => $post->id,
            'user_id' => $user->id,
        ]);

        $user->increment('xp', 25);

        return response()->json([
            'success' => true,
            'post'    => [
                'id'                 => 'rf_' . $post->id,
                'author'             => $user->name,
                'authorRole'         => $post->author_role,
                'type'               => $post->type,
                'title'              => $post->title,
                'content'            => $post->content,
                'codeSnippet'        => $post->code_snippet,
                'codeLanguage'       => $post->code_language,
                'upvotes'            => 1,
                'hasUpvoted'         => true,
                'comments'           => [],
                'timeAgo'            => 'hace un momento',
                'teacherEndorsement' => null,
            ],
        ], 201);
    }

    /**
     * Votar / Upvote en un post.
     */
    public function toggleUpvote(Request $request, int $postId): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $post = ClanPost::findOrFail($postId);
        $existing = ClanPostUpvote::where('post_id', $post->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $post->decrement('upvotes_count');
            $hasUpvoted = false;
        } else {
            ClanPostUpvote::create([
                'post_id' => $post->id,
                'user_id' => $user->id,
            ]);
            $post->increment('upvotes_count');
            $hasUpvoted = true;
        }

        return response()->json([
            'success'    => true,
            'hasUpvoted' => $hasUpvoted,
            'upvotes'    => max(0, $post->fresh()->upvotes_count),
        ]);
    }

    /**
     * Comentar en un post del clan.
     */
    public function storeComment(Request $request, int $postId): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $validated = $request->validate([
            'comment' => 'required|string|max:1000',
        ]);

        $post = ClanPost::findOrFail($postId);

        $comment = ClanPostComment::create([
            'post_id' => $post->id,
            'user_id' => $user->id,
            'comment' => $validated['comment'],
        ]);

        return response()->json([
            'success' => true,
            'comment' => [
                'id'        => 'c_' . $comment->id,
                'author'    => $user->name,
                'text'      => $comment->comment,
                'timeAgo'   => 'hace un momento',
                'isTeacher' => ($user->role === 'teacher'),
            ],
        ]);
    }

    /**
     * Crear un nuevo clan.
     */
    public function storeClan(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $validated = $request->validate([
            'name'              => 'required|string|max:100',
            'tag'               => 'required|string|max:10',
            'category'          => 'required|string|max:50',
            'description'       => 'required|string',
            'lines_of_research' => 'nullable|array',
        ]);

        $id = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $validated['tag'])) . '_' . rand(100, 999);

        $clan = Clan::create([
            'id'                => $id,
            'name'              => $validated['name'],
            'tag'               => strtoupper($validated['tag']),
            'category'          => $validated['category'],
            'description'       => $validated['description'],
            'lines_of_research' => $validated['lines_of_research'] ?? ['Investigación General en Sistemas'],
            'streak_days'       => 1,
            'level'             => 1,
            'level_title'       => 'Semillero Inicial',
            'current_xp'        => 0,
            'next_level_xp'     => 1000,
            'created_by'        => $user->id,
        ]);

        ClanMember::create([
            'clan_id'   => $clan->id,
            'user_id'   => $user->id,
            'role'      => 'Fundador y Líder de Clan',
            'joined_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'clan'    => $this->formatClan($clan, $user->id),
        ], 201);
    }

    // ==========================================
    // HELPERS DE FORMATEO
    // ==========================================

    private function formatClan(Clan $clan, ?int $currentUserId): array
    {
        $isMember = $currentUserId
            ? $clan->members->contains('user_id', $currentUserId)
            : false;

        $membersList = $clan->members->map(function (ClanMember $m) use ($currentUserId, $clan) {
            $u = $m->user;
            $level = max(1, (int) floor(($u->xp ?? 50) / 100) + 1);
            $nameParts = preg_split('/\s+/', trim($u->name ?? 'Estudiante'));
            $initials = count($nameParts) >= 2
                ? mb_substr($nameParts[0], 0, 1) . mb_substr($nameParts[1], 0, 1)
                : mb_substr($u->name ?? 'ES', 0, 2);

            return [
                'id'                 => 'm_' . $m->id,
                'userId'             => $m->user_id,
                'name'               => $u->name ?? 'Estudiante',
                'email'              => $u->email ?? '',
                'avatar'             => mb_strtoupper($initials),
                'role'               => $m->role,
                'level'              => $level,
                'contributionsCount' => $clan->posts->where('user_id', $m->user_id)->count(),
                'xpContributed'      => $u->xp ?? 50,
                'isCurrentUser'      => $currentUserId && $m->user_id === $currentUserId,
            ];
        })->values();

        $feed = $clan->posts->map(function (ClanPost $post) use ($currentUserId) {
            $author = $post->user;
            $hasUpvoted = $currentUserId
                ? $post->upvotes->contains('user_id', $currentUserId)
                : false;

            $comments = $post->comments->map(function (ClanPostComment $c) {
                return [
                    'id'        => 'c_' . $c->id,
                    'author'    => $c->user->name ?? 'Estudiante',
                    'text'      => $c->comment,
                    'timeAgo'   => $c->created_at->diffForHumans(),
                    'isTeacher' => ($c->user->role === 'teacher'),
                ];
            })->values();

            return [
                'id'                 => 'rf_' . $post->id,
                'author'             => $author->name ?? 'Estudiante',
                'authorRole'         => $post->author_role ?: 'Miembro del Clan',
                'type'               => $post->type,
                'title'              => $post->title,
                'content'            => $post->content,
                'codeSnippet'        => $post->code_snippet,
                'codeLanguage'       => $post->code_language,
                'upvotes'            => $post->upvotes_count,
                'hasUpvoted'         => $hasUpvoted,
                'comments'           => $comments,
                'timeAgo'            => $post->created_at->diffForHumans(),
                'teacherEndorsement' => $post->teacher_endorsement,
            ];
        })->values();

        $projects = $clan->projects->map(function (ClanProject $p) {
            $tasks = $p->tasks->map(fn (ClanProjectTask $t) => [
                'id'          => $t->id,
                'title'       => $t->title,
                'description' => $t->description,
                'status'      => $t->status,
                'type'        => $t->type,
                'assignedTo'  => $t->assigned_to,
                'completed'   => $t->completed,
                'xpReward'    => $t->xp_reward,
            ])->values()->toArray();

            $pullRequests = $p->pullRequests->map(fn (ClanProjectPullRequest $pr) => $this->formatPullRequest($pr))->values()->toArray();

            $commits = $p->commits->map(fn (ClanProjectCommit $c) => [
                'id'      => $c->id,
                'hash'    => $c->hash,
                'message' => $c->message,
                'author'  => $c->author,
                'branch'  => $c->branch,
                'timeAgo' => $c->time_ago ?: $c->created_at->diffForHumans(),
            ])->values()->toArray();

            return [
                'id'                   => $p->id,
                'title'                => $p->title,
                'description'          => $p->description,
                'leadResearcher'       => $p->lead_researcher,
                'status'               => $p->status,
                'techStack'            => $p->tech_stack ?: [],
                'membersJoined'        => $p->members_joined ?: [],
                'activeBranch'         => $p->active_branch,
                'productionDeployment' => $p->production_deployment,
                'tasks'                => $tasks,
                'pullRequests'         => $pullRequests,
                'commits'              => $commits,
                'createdAt'            => $p->created_at->toIso8601String(),
            ];
        })->values()->toArray();

        $recentLogs = $clan->posts->take(3)->map(function (ClanPost $p) {
            return [
                'author'  => $p->user->name ?? 'Estudiante',
                'message' => 'Publicó: "' . $p->title . '"',
                'timeAgo' => $p->created_at->diffForHumans(),
            ];
        })->values()->toArray();

        return [
            'id'              => $clan->id,
            'name'            => $clan->name,
            'tag'             => $clan->tag,
            'category'        => $clan->category,
            'description'     => $clan->description,
            'linesOfResearch' => $clan->lines_of_research ?: [],
            'membersCount'    => $clan->members->count(),
            'streakDays'      => $clan->streak_days ?: 1,
            'level'           => $clan->level ?: 3,
            'levelTitle'      => $clan->level_title ?: 'Laboratorio I+D de Sistemas',
            'currentXp'       => $clan->current_xp ?: 3450,
            'nextLevelXp'     => $clan->next_level_xp ?: 5000,
            'weeklyChallenge' => $clan->weekly_challenge ?: [
                'title'     => 'Micro-Kernel Modular y Planificador Round-Robin',
                'xpReward'  => 350,
                'completed' => false,
            ],
            'weeklyQuest'     => $clan->weekly_quest ?: [
                'title'        => 'Simulacro SEV-1: Deadlock por Inversión de Prioridades',
                'description'  => 'Reproducir deadlock en QEMU y desplegar parche de prioridad.',
                'targetCount'  => 3,
                'currentCount' => 1,
                'xpReward'     => 450,
                'completed'    => false,
            ],
            'isMember'        => $isMember,
            'researchers'     => $membersList,
            'researchFeed'    => $feed,
            'recentLogs'      => $recentLogs,
            'projects'        => $projects,
        ];
    }

    private function formatPullRequest(ClanProjectPullRequest $pr): array
    {
        return [
            'id'            => $pr->id,
            'number'        => $pr->number,
            'title'         => $pr->title,
            'description'   => $pr->description,
            'sourceBranch'  => $pr->source_branch,
            'targetBranch'  => $pr->target_branch,
            'status'        => $pr->status,
            'ciStatus'      => $pr->ci_status,
            'author'        => $pr->author,
            'authorRole'    => $pr->author_role,
            'previewUrl'    => $pr->preview_url,
            'buildDuration' => $pr->build_duration,
            'codeDiff'      => $pr->code_diff,
            'reviews'       => $pr->reviews ?: [],
            'xpReward'      => $pr->xp_reward,
            'linkedIssueId' => $pr->linked_issue_id,
            'mergedAt'      => $pr->merged_at,
            'mergedBy'      => $pr->merged_by,
            'timeAgo'       => $pr->created_at->diffForHumans(),
        ];
    }

    private function resolveUser(Request $request): ?User
    {
        if ($user = $request->user()) {
            return $user;
        }

        $email = $request->input('email') ?: $request->query('email');
        if ($email) {
            return User::where('email', strtolower(trim($email)))->first();
        }

        return User::first();
    }

    private function ensureWorkflowSeeded(): void
    {
        if (ClanProject::count() > 0) return;

        $seeder = new \Database\Seeders\ClanWorkflowSeeder();
        $seeder->run();
    }
}
