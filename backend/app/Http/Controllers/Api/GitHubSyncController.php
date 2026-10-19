<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GitHubSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GitHubSyncController extends Controller
{
    public function __construct(
        protected GitHubSyncService $githubSyncService
    ) {}

    /**
     * Comprueba el estado de sincronización con GitHub para el usuario autenticado.
     */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();
        $account = $this->githubSyncService->getConnectedAccount($user);
        $hasRepoScope = $this->githubSyncService->hasRepoScope($user);

        $syncsCount = $user->appNotifications()->where('type', 'github_sync')->count();
        $recentSyncs = $user->appNotifications()
            ->where('type', 'github_sync')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($n) => [
                'title'      => $n->title,
                'created_at' => $n->created_at?->diffForHumans(),
                'repo_url'   => $n->data['repo_url'] ?? null,
                'commit_url' => $n->data['commit_url'] ?? null,
                'file_url'   => $n->data['file_url'] ?? null,
                'repo_name'  => $n->data['repo_name'] ?? null,
            ]);

        return response()->json([
            'connected'      => $account !== null,
            'username'       => $account?->nickname,
            'avatar_url'     => $account?->avatar_url,
            'has_repo_scope' => $hasRepoScope,
            'syncs_count'    => $syncsCount,
            'xp_earned'      => $syncsCount * 25,
            'recent_syncs'   => $recentSyncs,
        ]);
    }

    /**
     * Sube un proyecto o solución directamente a GitHub.
     */
    public function sync(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'repo_name' => 'required|string|max:100|regex:/^[a-zA-Z0-9._-]+$/',
            'file_path' => 'required|string|max:255',
            'content' => 'required|string|max:500000', // max 500KB de código por archivo
            'commit_message' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:350',
            'is_private' => 'nullable|boolean',
        ], [
            'repo_name.required' => 'El nombre del repositorio es obligatorio.',
            'repo_name.regex' => 'El nombre del repositorio solo puede contener letras, números, puntos, guiones y guiones bajos.',
            'file_path.required' => 'La ruta del archivo es obligatoria (ej: src/solucion.py).',
            'content.required' => 'El contenido del código a sincronizar es obligatorio.',
        ]);

        $result = $this->githubSyncService->syncProject($request->user(), $validated);

        return response()->json($result);
    }
}
