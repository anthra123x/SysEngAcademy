<?php

namespace App\Services;

use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class GitHubSyncService
{
    /**
     * Obtiene la cuenta de GitHub vinculada al usuario.
     */
    public function getConnectedAccount(User $user): ?SocialAccount
    {
        return $user->socialAccounts()
            ->where('provider', 'github')
            ->first();
    }

    /**
     * Comprueba si el usuario tiene permiso (scope) para crear y modificar repositorios.
     */
    public function hasRepoScope(User $user): bool
    {
        $account = $this->getConnectedAccount($user);
        if (!$account || !$account->token) {
            return false;
        }

        $scopes = $account->scopes ?? [];
        return in_array('public_repo', $scopes, true) || in_array('repo', $scopes, true);
    }

    /**
     * Sube o sincroniza un archivo/proyecto directamente a un repositorio de GitHub del estudiante.
     *
     * @param User $user
     * @param array $payload [
     *     'repo_name' => string, // ej. 'syseng-codelab-soluciones' o 'practica-git-desde-cero'
     *     'description' => ?string,
     *     'file_path' => string, // ej. 'retos/inversion-arbol-binario.py'
     *     'content' => string, // Código en texto plano
     *     'commit_message' => ?string, // ej. 'feat(codelab): solucion a Inversion de Arbol'
     *     'is_private' => ?bool,
     * ]
     * @return array
     */
    public function syncProject(User $user, array $payload): array
    {
        $account = $this->getConnectedAccount($user);

        if (!$account || empty($account->token)) {
            throw ValidationException::withMessages([
                'github' => ['No tienes una cuenta de GitHub vinculada a tu perfil de SysEng Academy.'],
            ]);
        }

        if (!$this->hasRepoScope($user)) {
            throw ValidationException::withMessages([
                'scope' => ['Se requieren permisos de repositorio (public_repo) en tu cuenta de GitHub para realizar esta acción.'],
            ]);
        }

        $token = $account->token;
        $repoName = Str::slug($payload['repo_name'] ?? 'syseng-proyectos', '-');
        $filePath = ltrim(trim($payload['file_path'] ?? 'solution.txt'), '/');
        $content = (string) ($payload['content'] ?? '');
        $commitMessage = trim($payload['commit_message'] ?? "feat: subida de proyecto desde SysEng Academy");
        $description = trim($payload['description'] ?? "Proyectos y retos prácticos desarrollados en SysEng Academy (https://sysengacademy.site)");

        // 1. Obtener el nombre de usuario autenticado en GitHub
        $owner = $account->nickname;
        if (empty($owner)) {
            $userResponse = Http::withToken($token)
                ->withHeaders(['Accept' => 'application/vnd.github+json'])
                ->get('https://api.github.com/user');

            if ($userResponse->successful()) {
                $owner = $userResponse->json('login');
                $account->update(['nickname' => $owner]);
            } else {
                throw ValidationException::withMessages([
                    'github' => ['El token de GitHub ha expirado o es inválido. Por favor reconecta tu cuenta.'],
                ]);
            }
        }

        // 2. Verificar si el repositorio ya existe en GitHub
        $repoCheck = Http::withToken($token)
            ->withHeaders(['Accept' => 'application/vnd.github+json'])
            ->get("https://api.github.com/repos/{$owner}/{$repoName}");

        if ($repoCheck->status() === 404) {
            // El repositorio no existe: crearlo con inicialización automática (README.md)
            $createRepo = Http::withToken($token)
                ->withHeaders(['Accept' => 'application/vnd.github+json'])
                ->post('https://api.github.com/user/repos', [
                    'name' => $repoName,
                    'description' => $description,
                    'private' => false,
                    'auto_init' => true,
                ]);

            if (!$createRepo->successful()) {
                $errMsg = $createRepo->json('message') ?? 'Error al crear el repositorio en GitHub.';
                throw ValidationException::withMessages(['github' => [$errMsg]]);
            }

            // Breve espera para que GitHub propague el commit inicial del README
            usleep(400000); // 400ms
        } elseif (!$repoCheck->successful()) {
            throw ValidationException::withMessages([
                'github' => ['No fue posible acceder a tu repositorio en GitHub (' . $repoCheck->json('message') . ')'],
            ]);
        }

        // 3. Verificar si el archivo ya existe para obtener su SHA (requerido para actualización)
        $fileSha = null;
        $fileCheck = Http::withToken($token)
            ->withHeaders(['Accept' => 'application/vnd.github+json'])
            ->get("https://api.github.com/repos/{$owner}/{$repoName}/contents/{$filePath}");

        if ($fileCheck->successful()) {
            $fileSha = $fileCheck->json('sha');
        }

        // 4. Crear o actualizar el archivo con el commit del estudiante
        $putPayload = [
            'message' => $commitMessage,
            'content' => base64_encode($content),
            'committer' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
        ];

        if ($fileSha) {
            $putPayload['sha'] = $fileSha;
        }

        $commitResponse = Http::withToken($token)
            ->withHeaders(['Accept' => 'application/vnd.github+json'])
            ->put("https://api.github.com/repos/{$owner}/{$repoName}/contents/{$filePath}", $putPayload);

        if (!$commitResponse->successful()) {
            $errMsg = $commitResponse->json('message') ?? 'No se pudo realizar el commit en GitHub.';
            throw ValidationException::withMessages(['github' => [$errMsg]]);
        }

        $commitData = $commitResponse->json();
        $commitUrl = $commitData['commit']['html_url'] ?? "https://github.com/{$owner}/{$repoName}";
        $repoUrl = "https://github.com/{$owner}/{$repoName}";
        $fileUrl = $commitData['content']['html_url'] ?? "{$repoUrl}/blob/main/{$filePath}";

        // Recompensa en XP por subir a GitHub (gamificación)
        $user->increment('xp', 25);

        return [
            'success' => true,
            'owner' => $owner,
            'repo_name' => $repoName,
            'repo_url' => $repoUrl,
            'file_url' => $fileUrl,
            'commit_url' => $commitUrl,
            'commit_sha' => $commitData['commit']['sha'] ?? null,
            'xp_earned' => 25,
            'message' => "¡Proyecto subido exitosamente a tu repositorio en GitHub! Ganaste +25 XP.",
        ];
    }
}
