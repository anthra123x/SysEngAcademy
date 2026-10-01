<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Clan;
use App\Models\ClanMember;
use App\Models\ClanPost;
use App\Models\ClanPostComment;
use App\Models\ClanPostUpvote;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClanController extends Controller
{
    /**
     * Lista los clanes con miembros y actividad en tiempo real.
     */
    public function index(Request $request): JsonResponse
    {
        $this->ensureDefaultClansExist();

        $user = $this->resolveUser($request);
        $currentUserId = $user?->id;

        $clans = Clan::with([
            'members.user',
            'posts.user',
            'posts.comments.user',
            'posts.upvotes',
        ])->get();

        $data = $clans->map(function (Clan $clan) use ($currentUserId) {
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
                        'id'      => 'c_' . $c->id,
                        'author'  => $c->user->name ?? 'Estudiante',
                        'text'    => $c->comment,
                        'timeAgo' => $c->created_at->diffForHumans(),
                    ];
                })->values();

                return [
                    'id'           => 'rf_' . $post->id,
                    'author'       => $author->name ?? 'Estudiante',
                    'authorRole'   => 'Miembro del Clan',
                    'type'         => $post->type,
                    'title'        => $post->title,
                    'content'      => $post->content,
                    'codeSnippet'  => $post->code_snippet,
                    'codeLanguage' => $post->code_language,
                    'upvotes'      => $post->upvotes_count,
                    'hasUpvoted'   => $hasUpvoted,
                    'comments'     => $comments,
                    'timeAgo'      => $post->created_at->diffForHumans(),
                ];
            })->values();

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
                'weeklyChallenge' => $clan->weekly_challenge ?: [
                    'title'     => 'Objetivo Colaborativo de Algoritmos y Rendimiento',
                    'xpReward'  => 300,
                    'completed' => false,
                ],
                'isMember'        => $isMember,
                'researchers'     => $membersList,
                'researchFeed'    => $feed,
                'recentLogs'      => $recentLogs,
            ];
        });

        return response()->json($data);
    }

    /**
     * Unirse a un clan.
     */
    public function join(Request $request, string $id): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $clan = Clan::findOrFail($id);

        // Si ya pertenece a otro clan, opcionalmente salir o mantenerlo en este
        ClanMember::where('user_id', $user->id)->delete();

        ClanMember::create([
            'clan_id'   => $clan->id,
            'user_id'   => $user->id,
            'role'      => 'Cadete Investigador',
            'joined_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Te has unido exitosamente al clan {$clan->name}",
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
     * Publicar un post / reto / hallazgo en el clan.
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
            'type'          => 'nullable|string|in:discusion,hallazgo,reto,benchmark',
            'code_snippet'  => 'nullable|string',
            'code_language' => 'nullable|string|max:30',
        ]);

        $clan = Clan::findOrFail($clanId);

        // Asegurar que el usuario sea miembro
        ClanMember::firstOrCreate(
            ['clan_id' => $clan->id, 'user_id' => $user->id],
            ['role' => 'Cadete Investigador', 'joined_at' => now()]
        );

        $post = ClanPost::create([
            'clan_id'       => $clan->id,
            'user_id'       => $user->id,
            'title'         => $validated['title'],
            'content'       => $validated['content'],
            'type'          => $validated['type'] ?? 'discusion',
            'code_snippet'  => $validated['code_snippet'] ?? null,
            'code_language' => $validated['code_language'] ?? null,
            'upvotes_count' => 1,
        ]);

        // Auto upvote del autor
        ClanPostUpvote::create([
            'post_id' => $post->id,
            'user_id' => $user->id,
        ]);

        // Recompensa XP por colaboración
        $user->increment('xp', 25);

        return response()->json([
            'success' => true,
            'post'    => [
                'id'           => 'rf_' . $post->id,
                'author'       => $user->name,
                'authorRole'   => 'Miembro del Clan',
                'type'         => $post->type,
                'title'        => $post->title,
                'content'      => $post->content,
                'codeSnippet'  => $post->code_snippet,
                'codeLanguage' => $post->code_language,
                'upvotes'      => 1,
                'hasUpvoted'   => true,
                'comments'     => [],
                'timeAgo'      => 'hace un momento',
            ],
        ]);
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
                'id'      => 'c_' . $comment->id,
                'author'  => $user->name,
                'text'    => $comment->comment,
                'timeAgo' => 'hace un momento',
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
            'clan'    => $clan,
        ]);
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

    private function ensureDefaultClansExist(): void
    {
        if (Clan::count() > 0) return;

        $defaults = [
            [
                'id'                => 'krnl',
                'name'              => 'Kernel & C++ Systems Hackers',
                'tag'               => '[KRNL]',
                'category'          => 'systems',
                'description'       => 'Estudio intensivo de llamadas POSIX, memoria virtual, concurrencia de bajo nivel y arquitectura de micro-kernels.',
                'lines_of_research' => ['Gestión de Memoria y Paginación x86_64', 'Concurrencia Lock-Free & Atomics', 'Llamadas POSIX & Observabilidad eBPF'],
                'streak_days'       => 4,
                'weekly_challenge'  => ['title' => 'Implementar un Thread Pool en C++20 con mutex POSIX', 'xpReward' => 350, 'completed' => false],
            ],
            [
                'id'                => 'algo',
                'name'              => 'Clan de Algoritmos & Grafos',
                'tag'               => '[ALGO]',
                'category'          => 'algorithms',
                'description'       => 'Resolución de problemas de alta complejidad algorítmica, árboles balanceados y optimización combinatoria.',
                'lines_of_research' => ['Algoritmos de Enrutamiento en Grafos Masivos', 'Estructuras de Datos Auto-Balanceadas', 'Programación Dinámica Avanzada'],
                'streak_days'       => 3,
                'weekly_challenge'  => ['title' => 'Calcular Camino Más Corto con Dijkstra sobre Grafos', 'xpReward' => 280, 'completed' => false],
            ],
            [
                'id'                => 'arch',
                'name'              => 'Arquitectura Backend & APIs',
                'tag'               => '[ARCH]',
                'category'          => 'backend',
                'description'       => 'Diseño de microservicios resilientes, bases de datos distribuidas, mensajería asíncrona y alta disponibilidad.',
                'lines_of_research' => ['Patrones CQRS y Event Sourcing', 'Consistencia Eventual en Sistemas Distribuidos', 'Caching Multicapa con Redis & Edge'],
                'streak_days'       => 5,
                'weekly_challenge'  => ['title' => 'Diseñar pipeline de eventos con Apache Kafka y failover', 'xpReward' => 320, 'completed' => false],
            ],
            [
                'id'                => 'sec',
                'name'              => 'Red Team & Application Security',
                'tag'               => '[SEC]',
                'category'          => 'security',
                'description'       => 'Análisis de vulnerabilidades, auditorías de código estático y dinámico, criptografía aplicada y DevSecOps.',
                'lines_of_research' => ['Criptografía de Curvas Elípticas y Zero-Knowledge', 'Mitigación de Vulnerabilidades OWASP Top 10', 'Infraestructura Segura con Kubernetes & Istio'],
                'streak_days'       => 2,
                'weekly_challenge'  => ['title' => 'Explotar y parchear inyección SQL ciega de segundo orden', 'xpReward' => 400, 'completed' => false],
            ],
            [
                'id'                => 'ai',
                'name'              => 'Machine Learning & IA Aplicada',
                'tag'               => '[AI]',
                'category'          => 'ai',
                'description'       => 'Modelado predictivo, redes neuronales profundas, NLP con Transformers y optimización de inferencia.',
                'lines_of_research' => ['Arquitectura Transformer & Fine-Tuning de LLMs', 'Sistemas de Recomendación Basados en Grafos', 'MLOps: Pipelines Automatizados con MLflow'],
                'streak_days'       => 6,
                'weekly_challenge'  => ['title' => 'Entrenar clasificador de sentimiento con embeddings BERT', 'xpReward' => 380, 'completed' => false],
            ],
        ];

        foreach ($defaults as $clanData) {
            Clan::create($clanData);
        }

        // Si hay usuarios existentes (como Camilo), asociar al primer clan como miembro fundador
        $firstUser = User::first();
        if ($firstUser) {
            ClanMember::firstOrCreate([
                'clan_id' => 'krnl',
                'user_id' => $firstUser->id,
            ], [
                'role' => 'Líder Investigador',
                'joined_at' => now(),
            ]);
        }
    }
}
