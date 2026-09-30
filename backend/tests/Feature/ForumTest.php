<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\ForumPost;
use App\Models\ForumReply;
use App\Models\Module;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Foro de discusiones: listado paginado y filtrable (módulo, lección,
 * categoría, búsqueda insensible a mayúsculas), creación de posts y respuestas,
 * votos y marcado de solución por parte del autor o del staff.
 *
 * Usa la BD pgsql del entorno (sin RefreshDatabase) para no destruir los datos
 * sembrados; los writes se revierten con transacciones. Requiere
 * `php artisan migrate --seed` previo.
 */
class ForumTest extends TestCase
{
    use DatabaseTransactions;

    protected function makeCourse(string $suffix): Course
    {
        return Course::create([
            'slug' => "curso-foro-{$suffix}",
            'title' => "Curso foro {$suffix}",
            'description' => 'Fixture de prueba del foro',
            'is_published' => true,
            'is_free' => true,
            'difficulty' => 'beginner',
        ]);
    }

    protected function makeModule(Course $course, string $title = 'Módulo 1', int $order = 1): Module
    {
        return Module::create([
            'course_id' => $course->id,
            'title' => $title,
            'order' => $order,
        ]);
    }

    protected function makePost(Course $course, User $user, array $attributes = []): ForumPost
    {
        return ForumPost::create(array_merge([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'module_id' => null,
            'lesson_id' => null,
            'title' => 'Título de prueba del foro',
            'content' => 'Contenido de prueba suficientemente largo.',
            'category' => 'question',
            'upvotes' => 0,
            'is_solved' => false,
        ], $attributes));
    }

    protected function makeReply(ForumPost $post, User $user, string $content = 'Respuesta de prueba'): ForumReply
    {
        return ForumReply::create([
            'post_id' => $post->id,
            'user_id' => $user->id,
            'content' => $content,
            'is_solution' => false,
            'upvotes' => 0,
        ]);
    }

    protected function student(): User
    {
        return User::where('email', 'estudiante@sysengacademy.dev')->firstOrFail();
    }

    protected function instructor(): User
    {
        return User::where('email', 'instructor@sysengacademy.dev')->firstOrFail();
    }

    public function test_index_publico_devuelve_paginacion_y_posts_del_curso(): void
    {
        $suffix = uniqid();
        $course = $this->makeCourse($suffix);
        $module = $this->makeModule($course);
        $post = $this->makePost($course, $this->student(), [
            'module_id' => $module->id,
            'title' => 'Consulta visible en el listado',
            'content' => 'Necesito ayuda con este punto concreto del temario.',
        ]);

        $response = $this->getJson("/api/courses/{$course->slug}/forum");

        $response->assertOk()
            ->assertJsonStructure(['data', 'total', 'current_page', 'per_page', 'last_page'])
            ->assertJsonPath('total', 1)
            ->assertJsonPath('current_page', 1)
            ->assertJsonPath('per_page', 20)
            ->assertJsonPath('data.0.id', $post->id)
            ->assertJsonPath('data.0.title', 'Consulta visible en el listado')
            ->assertJsonPath('data.0.category', 'question')
            ->assertJsonPath('data.0.module_id', $module->id)
            ->assertJsonPath('data.0.module.title', 'Módulo 1')
            ->assertJsonPath('data.0.replies_count', 0)
            ->assertJsonPath('data.0.user.id', $this->student()->id)
            ->assertJsonPath('data.0.user.name', $this->student()->name)
            ->assertJsonPath('data.0.user.role', 'student');
    }

    public function test_index_filtra_por_modulo(): void
    {
        $suffix = uniqid();
        $course = $this->makeCourse($suffix);
        $moduleA = $this->makeModule($course, 'Módulo A', 1);
        $moduleB = $this->makeModule($course, 'Módulo B', 2);

        $postA = $this->makePost($course, $this->student(), ['module_id' => $moduleA->id, 'title' => 'Duda del módulo A']);
        $postB = $this->makePost($course, $this->student(), ['module_id' => $moduleB->id, 'title' => 'Duda del módulo B']);

        $response = $this->getJson("/api/courses/{$course->slug}/forum?module_id={$moduleA->id}");

        $response->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.id', $postA->id)
            ->assertJsonPath('data.0.module_id', $moduleA->id);

        $this->assertNotContains($postB->id, array_column($response->json('data'), 'id'));

        // El filtro del módulo B devuelve exclusivamente su post
        $this->getJson("/api/courses/{$course->slug}/forum?module_id={$moduleB->id}")
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.id', $postB->id);

        // Los posts sin módulo no se colan al filtrar por módulo
        $this->makePost($course, $this->student(), ['module_id' => null, 'title' => 'Pregunta general del curso']);

        $this->getJson("/api/courses/{$course->slug}/forum?module_id={$moduleA->id}")
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.id', $postA->id);
    }

    public function test_index_filtra_por_categoria(): void
    {
        $suffix = uniqid();
        $course = $this->makeCourse($suffix);
        $student = $this->student();

        $expected = [];
        foreach (['question', 'solution', 'exam', 'discussion'] as $category) {
            $expected[$category] = $this->makePost($course, $student, [
                'category' => $category,
                'title' => "Post de categoría {$category}",
            ]);
        }

        foreach ($expected as $category => $post) {
            $this->getJson("/api/courses/{$course->slug}/forum?category={$category}")
                ->assertOk()
                ->assertJsonPath('total', 1)
                ->assertJsonPath('data.0.id', $post->id)
                ->assertJsonPath('data.0.category', $category);
        }
    }

    public function test_index_busqueda_usa_ilike_case_insensitive(): void
    {
        $suffix = uniqid();
        $course = $this->makeCourse($suffix);

        $post = $this->makePost($course, $this->student(), [
            'title' => 'Configurar el proyecto Laravel desde cero',
            'content' => 'Estoy usando Vagrant y no logro levantar el entorno.',
        ]);
        $this->makePost($course, $this->student(), [
            'title' => 'Duda sobre decorators en Python',
            'content' => '¿Alguien sabe explicarlos con un ejemplo práctico?',
        ]);

        // `ilike` en pgsql: encuentra el título ignorando mayúsculas/minúsculas
        $this->getJson("/api/courses/{$course->slug}/forum?search=LARAVEL")
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.id', $post->id);

        // Mismo resultado con capitalización distinta
        $this->getJson("/api/courses/{$course->slug}/forum?search=lArAvEl")
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.id', $post->id);

        // Un término que solo se diferencia en mayúsculas/minúsculas sigue
        // sin coincidir: `ilike` pliega la caja en ambos lados.
        $this->getJson("/api/courses/{$course->slug}/forum?search=laravelz")
            ->assertOk()
            ->assertJsonPath('total', 0);

        // La búsqueda también alcanza el cuerpo del post
        $this->getJson("/api/courses/{$course->slug}/forum?search=vagrant")
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.id', $post->id);

        // Un término ausente no devuelve nada
        $this->getJson("/api/courses/{$course->slug}/forum?search=terraform")
            ->assertOk()
            ->assertJsonPath('total', 0)
            ->assertJsonCount(0, 'data');
    }

    public function test_index_no_filtra_por_id_de_otro_curso(): void
    {
        $suffix = uniqid();
        $courseA = $this->makeCourse("a-{$suffix}");
        $courseB = $this->makeCourse("b-{$suffix}");
        $moduleB = $this->makeModule($courseB, 'Módulo ajeno', 1);

        $postA = $this->makePost($courseA, $this->student(), ['title' => 'Pregunta del curso A']);
        $postB = $this->makePost($courseB, $this->student(), [
            'module_id' => $moduleB->id,
            'title' => 'Pregunta del curso B',
        ]);

        $response = $this->getJson("/api/courses/{$courseA->slug}/forum");

        $response->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.id', $postA->id);

        $this->assertNotContains($postB->id, array_column($response->json('data'), 'id'));

        // Aunque se conozca el módulo de otro curso, el filtro no cruza fronteras
        $this->getJson("/api/courses/{$courseA->slug}/forum?module_id={$moduleB->id}")
            ->assertOk()
            ->assertJsonPath('total', 0)
            ->assertJsonCount(0, 'data');
    }

    public function test_store_crea_post_asociado_al_curso_con_modulo_opcional(): void
    {
        $suffix = uniqid();
        $course = $this->makeCourse($suffix);
        $module = $this->makeModule($course);
        $user = $this->student();

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/courses/{$course->slug}/forum", [
            'title' => '¿Cómo funciona el ciclo de vida de un componente?',
            'content' => 'No me queda claro cuándo se ejecuta el OnInit frente al constructor.',
        ]);

        $response->assertCreated()
            ->assertJsonPath('course_id', $course->id)
            ->assertJsonPath('user_id', $user->id)
            ->assertJsonPath('category', 'question')
            ->assertJsonPath('module_id', null)
            ->assertJsonPath('lesson_id', null)
            ->assertJsonPath('upvotes', 0)
            ->assertJsonPath('is_solved', false)
            ->assertJsonPath('replies_count', 0);

        $postId = $response->json('id');

        $this->assertDatabaseHas('forum_posts', [
            'id' => $postId,
            'course_id' => $course->id,
            'user_id' => $user->id,
            'category' => 'question',
            'module_id' => null,
            'is_solved' => false,
        ]);

        // El módulo es opcional pero, cuando viaja, debe persistirse
        $withModule = $this->postJson("/api/courses/{$course->slug}/forum", [
            'title' => 'Duda anclada a un módulo concreto',
            'content' => 'Esta pregunta pertenece al módulo uno del curso.',
            'module_id' => $module->id,
            'category' => 'discussion',
        ]);

        $withModule->assertCreated()
            ->assertJsonPath('module_id', $module->id)
            ->assertJsonPath('module.title', 'Módulo 1')
            ->assertJsonPath('category', 'discussion');

        $this->assertDatabaseHas('forum_posts', [
            'id' => $withModule->json('id'),
            'module_id' => $module->id,
            'course_id' => $course->id,
        ]);

        // Y el post nuevo aparece en el listado del curso
        $this->getJson("/api/courses/{$course->slug}/forum?module_id={$module->id}")
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.id', $withModule->json('id'));
    }

    public function test_store_rechaza_titulo_o_contenido_invalidos(): void
    {
        $suffix = uniqid();
        $course = $this->makeCourse($suffix);

        Sanctum::actingAs($this->student());

        $this->postJson("/api/courses/{$course->slug}/forum", [
            'title' => 'abc',
            'content' => 'Contenido de prueba suficientemente largo.',
        ])->assertUnprocessable()->assertJsonValidationErrors(['title']);

        $this->postJson("/api/courses/{$course->slug}/forum", [
            'title' => 'Título válido del post',
            'content' => 'corto',
        ])->assertUnprocessable()->assertJsonValidationErrors(['content']);

        $this->postJson("/api/courses/{$course->slug}/forum", [
            'title' => 'Título válido del post',
            'content' => 'Contenido de prueba suficientemente largo.',
            'category' => 'banana',
        ])->assertUnprocessable()->assertJsonValidationErrors(['category']);

        // Los ids viajan como string desde los formularios: se rechazan igual
        $this->postJson("/api/courses/{$course->slug}/forum", [
            'title' => 'Título válido del post',
            'content' => 'Contenido de prueba suficientemente largo.',
            'module_id' => '999999999',
        ])->assertUnprocessable()->assertJsonValidationErrors(['module_id']);

        $this->postJson("/api/courses/{$course->slug}/forum", [
            'title' => 'Título válido del post',
            'content' => 'Contenido de prueba suficientemente largo.',
            'lesson_id' => '999999999',
        ])->assertUnprocessable()->assertJsonValidationErrors(['lesson_id']);

        // Ningún post inválido llegó a la base de datos
        $this->assertDatabaseMissing('forum_posts', ['course_id' => $course->id]);
    }

    public function test_store_requiere_autenticacion(): void
    {
        $suffix = uniqid();
        $course = $this->makeCourse($suffix);

        $this->postJson("/api/courses/{$course->slug}/forum", [
            'title' => 'Título válido del post',
            'content' => 'Contenido de prueba suficientemente largo.',
        ])->assertUnauthorized();

        $this->assertDatabaseMissing('forum_posts', ['course_id' => $course->id]);
    }

    public function test_store_rechaza_module_id_inexistente(): void
    {
        $suffix = uniqid();
        $course = $this->makeCourse($suffix);

        Sanctum::actingAs($this->student());

        $this->postJson("/api/courses/{$course->slug}/forum", [
            'title' => 'Título válido del post',
            'content' => 'Contenido de prueba suficientemente largo.',
            'module_id' => 999999999,
        ])->assertUnprocessable()->assertJsonValidationErrors(['module_id']);

        $this->postJson("/api/courses/{$course->slug}/forum", [
            'title' => 'Título válido del post',
            'content' => 'Contenido de prueba suficientemente largo.',
            'lesson_id' => 999999999,
        ])->assertUnprocessable()->assertJsonValidationErrors(['lesson_id']);

        $this->assertDatabaseMissing('forum_posts', ['course_id' => $course->id]);
    }

    public function test_store_reply_crea_respuesta_en_hilo(): void
    {
        $suffix = uniqid();
        $course = $this->makeCourse($suffix);
        $author = $this->student();
        $post = $this->makePost($course, $author);
        $responder = User::factory()->create(['role' => 'student']);

        Sanctum::actingAs($responder);

        $response = $this->postJson("/api/forum/posts/{$post->id}/replies", [
            'content' => 'Prueba el panel de Tinker para inspeccionar el contenedor.',
        ]);

        $response->assertCreated()
            ->assertJsonPath('post_id', $post->id)
            ->assertJsonPath('user_id', $responder->id)
            ->assertJsonPath('is_solution', false)
            ->assertJsonPath('upvotes', 0)
            ->assertJsonPath('user.id', $responder->id);

        $this->assertDatabaseHas('forum_replies', [
            'id' => $response->json('id'),
            'post_id' => $post->id,
            'user_id' => $responder->id,
            'is_solution' => false,
        ]);

        // El hilo refleja el conteo al recargar el post
        $this->getJson("/api/forum/posts/{$post->id}")
            ->assertOk()
            ->assertJsonPath('id', $post->id)
            ->assertJsonPath('replies_count', 1)
            ->assertJsonCount(1, 'replies')
            ->assertJsonPath('replies.0.id', $response->json('id'))
            ->assertJsonPath('replies.0.content', 'Prueba el panel de Tinker para inspeccionar el contenedor.');
    }

    public function test_store_reply_requiere_autenticacion(): void
    {
        $suffix = uniqid();
        $course = $this->makeCourse($suffix);
        $post = $this->makePost($course, $this->student());

        $this->postJson("/api/forum/posts/{$post->id}/replies", [
            'content' => 'Respuesta anónima que nunca debe persistirse.',
        ])->assertUnauthorized();

        $this->assertSame(0, ForumReply::where('post_id', $post->id)->count(), 'La respuesta anónima no debe persistirse.');
        $this->assertDatabaseMissing('forum_replies', [
            'content' => 'Respuesta anónima que nunca debe persistirse.',
        ]);
    }

    public function test_upvote_incrementa_votos(): void
    {
        $suffix = uniqid();
        $course = $this->makeCourse($suffix);
        $post = $this->makePost($course, $this->student(), ['upvotes' => 3]);

        Sanctum::actingAs(User::factory()->create(['role' => 'student']));

        $this->postJson("/api/forum/posts/{$post->id}/upvote")
            ->assertOk()
            ->assertJsonPath('upvotes', 4);

        $this->assertDatabaseHas('forum_posts', ['id' => $post->id, 'upvotes' => 4]);

        // Cada upvote suma uno más (no hay límite ni registro por usuario)
        $this->postJson("/api/forum/posts/{$post->id}/upvote")
            ->assertOk()
            ->assertJsonPath('upvotes', 5);

        $this->assertDatabaseHas('forum_posts', ['id' => $post->id, 'upvotes' => 5]);
        $this->assertSame(5, $post->fresh()->upvotes);
    }

    public function test_upvote_requiere_autenticacion(): void
    {
        $suffix = uniqid();
        $course = $this->makeCourse($suffix);
        $post = $this->makePost($course, $this->student(), ['upvotes' => 0]);

        $this->postJson("/api/forum/posts/{$post->id}/upvote")
            ->assertUnauthorized();

        $this->assertDatabaseHas('forum_posts', ['id' => $post->id, 'upvotes' => 0]);
    }

    public function test_marcar_solucion_solo_autor_o_staff(): void
    {
        $suffix = uniqid();
        $course = $this->makeCourse($suffix);
        $author = $this->student();
        $post = $this->makePost($course, $author, ['is_solved' => false]);

        $replyByThird = $this->makeReply($post, User::factory()->create(['role' => 'student']), 'Respuesta de un tercero');
        $replyByAuthor = $this->makeReply($post, $author, 'Respuesta del autor del post');

        // Un usuario sin relación con el hilo no puede marcar solución
        Sanctum::actingAs(User::factory()->create(['role' => 'student']));
        $this->postJson("/api/forum/replies/{$replyByThird->id}/solution")
            ->assertForbidden();

        $this->assertDatabaseHas('forum_replies', ['id' => $replyByThird->id, 'is_solution' => false]);
        $this->assertDatabaseHas('forum_posts', ['id' => $post->id, 'is_solved' => false]);

        // El autor del post sí puede marcar su propia respuesta
        Sanctum::actingAs($author);
        $this->postJson("/api/forum/replies/{$replyByAuthor->id}/solution")
            ->assertOk()
            ->assertJsonPath('id', $replyByAuthor->id)
            ->assertJsonPath('is_solution', true);

        $this->assertDatabaseHas('forum_replies', ['id' => $replyByAuthor->id, 'is_solution' => true]);
        $this->assertDatabaseHas('forum_posts', ['id' => $post->id, 'is_solved' => true]);

        // El staff puede hacerlo aunque no sea el autor
        $replyByInstructor = $this->makeReply($post, $this->instructor(), 'Respuesta del instructor');
        Sanctum::actingAs($this->instructor());
        $this->postJson("/api/forum/replies/{$replyByInstructor->id}/solution")
            ->assertOk()
            ->assertJsonPath('is_solution', true);

        $this->assertDatabaseHas('forum_replies', ['id' => $replyByInstructor->id, 'is_solution' => true]);
    }

    public function test_marcar_solucion_desmarca_respuestas_previas(): void
    {
        $suffix = uniqid();
        $course = $this->makeCourse($suffix);
        $author = $this->student();
        $post = $this->makePost($course, $author);

        $first = $this->makeReply($post, User::factory()->create(['role' => 'student']), 'Primera respuesta candidata');
        $second = $this->makeReply($post, User::factory()->create(['role' => 'student']), 'Segunda respuesta candidata');

        Sanctum::actingAs($author);

        $this->postJson("/api/forum/replies/{$first->id}/solution")->assertOk();
        $this->assertDatabaseHas('forum_replies', ['id' => $first->id, 'is_solution' => true]);

        // Marcar otra respuesta del mismo post deja una única solución
        $this->postJson("/api/forum/replies/{$second->id}/solution")
            ->assertOk()
            ->assertJsonPath('id', $second->id)
            ->assertJsonPath('is_solution', true);

        $this->assertDatabaseHas('forum_replies', ['id' => $first->id, 'is_solution' => false]);
        $this->assertDatabaseHas('forum_replies', ['id' => $second->id, 'is_solution' => true]);

        $this->assertSame(
            1,
            ForumReply::where('post_id', $post->id)->where('is_solution', true)->count(),
            'Un post no puede tener más de una respuesta marcada como solución.'
        );

        $this->assertDatabaseHas('forum_posts', ['id' => $post->id, 'is_solved' => true]);
    }
}
