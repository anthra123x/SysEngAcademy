<?php

namespace Tests\Feature;

use App\Models\Clan;
use App\Models\ClanProject;
use App\Models\ClanProjectPullRequest;
use App\Models\ClanProjectTask;
use App\Models\User;
use Database\Seeders\ClanWorkflowSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClanWorkflowTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Asegurar que la BD tiene los semilleros y proyectos iniciales
        if (ClanProject::count() === 0) {
            $seeder = new ClanWorkflowSeeder();
            $seeder->run();
        }
    }

    public function test_can_list_clans_with_engineering_workflow()
    {
        $response = $this->getJson('/api/clans');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => [
                'id',
                'name',
                'tag',
                'category',
                'level',
                'projects' => [
                    '*' => [
                        'id',
                        'title',
                        'tasks',
                        'pullRequests',
                        'commits',
                        'productionDeployment',
                    ]
                ]
            ]
        ]);
    }

    public function test_can_create_task_and_update_status_kanban()
    {
        $clan = Clan::first();
        $project = ClanProject::where('clan_id', $clan->id)->first();
        $user = User::first();

        // 1. Crear tarea en Backlog
        $response = $this->actingAs($user)->postJson("/api/clans/{$clan->id}/projects/{$project->id}/tasks", [
            'title'       => 'Optimizar Algoritmo de Paginación TLB',
            'description' => 'Reducir fallos de página implementando LRU aproximado.',
            'type'        => 'perf',
            'xp_reward'   => 50,
        ]);

        $response->assertStatus(201);
        $taskId = $response->json('task.id');
        $this->assertNotEmpty($taskId);

        // 2. Mover a In Progress (Drag and Drop)
        $updateResponse = $this->actingAs($user)->patchJson("/api/clans/{$clan->id}/projects/{$project->id}/tasks/{$taskId}/status", [
            'status' => 'in_progress',
        ]);

        $updateResponse->assertStatus(200);
        $this->assertEquals('in_progress', $updateResponse->json('task.status'));

        // 3. Mover a Completed
        $completeResponse = $this->actingAs($user)->patchJson("/api/clans/{$clan->id}/projects/{$project->id}/tasks/{$taskId}/status", [
            'status' => 'completed',
        ]);

        $completeResponse->assertStatus(200);
        $this->assertEquals('completed', $completeResponse->json('task.status'));
        $this->assertTrue($completeResponse->json('task.completed'));
    }

    public function test_can_create_review_and_merge_pull_request()
    {
        $clan = Clan::first();
        $project = ClanProject::where('clan_id', $clan->id)->first();
        $teacher = User::where('role', 'teacher')->first() ?: User::first();

        // 1. Abrir PR
        $prResponse = $this->actingAs($teacher)->postJson("/api/clans/{$clan->id}/projects/{$project->id}/pull-requests", [
            'title'         => 'feat(kernel): Implementar Ring Buffer para IPC libre de locks',
            'description'   => 'Cola circular atómica para paso de mensajes ultrarrápido.',
            'source_branch' => 'feat/lockless-ipc-ring',
            'code_snippet'  => "+ atomic_ring_buffer_t ipc_bus;\n+ void push_msg() { atomic_store(); }",
            'filename'      => 'kernel/ipc/ring_buffer.h',
        ]);

        $prResponse->assertStatus(201);
        $prId = $prResponse->json('pr.id');
        $this->assertStringContainsString('syseng-kernel-git-feat-lockless-ipc-ring.vercel.app', $prResponse->json('pr.previewUrl'));

        // 2. Revisión técnica con Aval de Cátedra (LGTM)
        $reviewResponse = $this->actingAs($teacher)->postJson("/api/clans/{$clan->id}/projects/{$project->id}/pull-requests/{$prId}/reviews", [
            'verdict' => 'approved',
            'comment' => 'Arquitectura atómica aprobada. Cumple con latencia sub-microsegundo.',
        ]);

        $reviewResponse->assertStatus(200);
        $this->assertCount(1, $reviewResponse->json('pr.reviews'));

        // 3. Fusión y despliegue a producción
        $mergeResponse = $this->actingAs($teacher)->postJson("/api/clans/{$clan->id}/projects/{$project->id}/pull-requests/{$prId}/merge");

        $mergeResponse->assertStatus(200);
        $this->assertEquals('merged', $mergeResponse->json('pr.status'));
        $this->assertEquals('ready', $mergeResponse->json('productionDeployment.status'));
        $this->assertEquals('main', $mergeResponse->json('productionDeployment.branch'));
    }

    public function test_can_endorse_rfc_post_with_catedra_stamp()
    {
        $clan = Clan::first();
        $post = $clan->posts()->first();
        $teacher = User::where('role', 'teacher')->first() ?: User::first();

        if ($post) {
            $response = $this->actingAs($teacher)->postJson("/api/clans/{$clan->id}/posts/{$post->id}/endorse", [
                'note' => 'Excelente propuesta de diseño para el planificador de threads.',
            ]);

            $response->assertStatus(200);
            $this->assertEquals(80, $response->json('teacherEndorsement.xpAwarded'));
        }
    }

    public function test_can_resolve_incident_drill()
    {
        $clan = Clan::first();
        $user = User::first();

        $response = $this->actingAs($user)->postJson("/api/clans/{$clan->id}/drills/resolve");

        $response->assertStatus(200);
        $this->assertTrue($response->json('weeklyQuest.completed'));
    }
}
