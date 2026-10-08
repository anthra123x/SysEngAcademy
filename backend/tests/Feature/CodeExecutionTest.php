<?php

namespace Tests\Feature;

use App\Services\LanguageRegistry;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class CodeExecutionTest extends TestCase
{
    use WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        RateLimiter::clear('code-exec:ip:127.0.0.1');
        RateLimiter::clear('code-exec:user:1');
    }

    public function test_get_languages_returns_catalog(): void
    {
        $response = $this->getJson('/api/languages');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => ['id', 'label', 'mode', 'sample', 'engine'],
            ]);

        $languages = $response->json();
        $this->assertCount(13, $languages);

        $ids = array_column($languages, 'id');
        $this->assertContains('pseint', $ids);
        $this->assertContains('php', $ids);
        $this->assertContains('python', $ids);
        $this->assertContains('javascript', $ids);
        $this->assertContains('typescript', $ids);
        $this->assertContains('c', $ids);
        $this->assertContains('cpp', $ids);
        $this->assertContains('java', $ids);
        $this->assertContains('sql', $ids);
        $this->assertContains('bash', $ids);
        $this->assertContains('csharp', $ids);
        $this->assertContains('go', $ids);
        $this->assertContains('rust', $ids);

        $pseint = array_values(array_filter($languages, fn ($l) => $l['id'] === 'pseint'))[0];
        $this->assertEquals('local', $pseint['engine']);

        $php = array_values(array_filter($languages, fn ($l) => $l['id'] === 'php'))[0];
        $this->assertEquals('piston', $php['engine']);
        $this->assertArrayHasKey('piston_runtime', $php);
        $this->assertArrayHasKey('piston_version', $php);
    }

    public function test_execute_pseint_returns_local_engine_flag(): void
    {
        $response = $this->postJson('/api/code/execute', [
            'language' => 'pseint',
            'code' => 'Algoritmo Test\n    Escribir "Hola"\nFinAlgoritmo',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'stdout',
                'stderr',
                'exit_code',
                'tests',
                'execution_time_ms',
                'language',
                'engine',
                'message',
            ]);

        $data = $response->json();
        $this->assertEquals('pseint', $data['language']);
        $this->assertEquals('local', $data['engine']);
        $this->assertStringContainsString('navegador', $data['message']);
    }

    public function test_execute_php_via_piston_success(): void
    {
        Http::fake([
            'https://emkc.org/api/v2/piston/execute' => Http::response([
                'run' => [
                    'stdout' => "¡Hola, mundo!\n",
                    'stderr' => '',
                    'code' => 0,
                ],
            ], 200),
        ]);

        $response = $this->postJson('/api/code/execute', [
            'language' => 'php',
            'code' => '<?php echo "¡Hola, mundo!\n";',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'stdout',
                'stderr',
                'exit_code',
                'tests',
                'execution_time_ms',
                'language',
            ]);

        $data = $response->json();
        $this->assertEquals('php', $data['language']);
        $this->assertEquals("¡Hola, mundo!\n", $data['stdout']);
        $this->assertEquals(0, $data['exit_code']);
        $this->assertEquals([], $data['tests']);
        $this->assertGreaterThan(0, $data['execution_time_ms']);
    }

    public function test_execute_python_via_piston_success(): void
    {
        Http::fake([
            'https://emkc.org/api/v2/piston/execute' => Http::response([
                'run' => [
                    'stdout' => "¡Hola, mundo!\n",
                    'stderr' => '',
                    'code' => 0,
                ],
            ], 200),
        ]);

        $response = $this->postJson('/api/code/execute', [
            'language' => 'python',
            'code' => 'print("¡Hola, mundo!")',
        ]);

        $response->assertStatus(200);

        $data = $response->json();
        $this->assertEquals('python', $data['language']);
        $this->assertEquals("¡Hola, mundo!\n", $data['stdout']);
        $this->assertEquals(0, $data['exit_code']);
    }

    public function test_execute_with_tests_returns_test_results(): void
    {
        Http::fake([
            'https://emkc.org/api/v2/piston/execute' => Http::sequence()
                ->push([
                    'run' => ['stdout' => "4\n", 'stderr' => '', 'code' => 0],
                ], 200)
                ->push([
                    'run' => ['stdout' => "4\n", 'stderr' => '', 'code' => 0],
                ], 200)
                ->push([
                    'run' => ['stdout' => "9\n", 'stderr' => '', 'code' => 0],
                ], 200),
        ]);

        $response = $this->postJson('/api/code/execute', [
            'language' => 'python',
            'code' => 'a = int(input()); print(a * a)',
            'tests' => [
                ['input' => '2', 'expected' => '4'],
                ['input' => '3', 'expected' => '9'],
            ],
        ]);

        $response->assertStatus(200);

        $data = $response->json();
        $this->assertCount(2, $data['tests']);
        $this->assertEquals('2', $data['tests'][0]['input']);
        $this->assertEquals('4', $data['tests'][0]['expected']);
        $this->assertEquals('4', $data['tests'][0]['actual']);
        $this->assertTrue($data['tests'][0]['passed']);
        $this->assertEquals('3', $data['tests'][1]['input']);
        $this->assertEquals('9', $data['tests'][1]['expected']);
        $this->assertEquals('9', $data['tests'][1]['actual']);
        $this->assertTrue($data['tests'][1]['passed']);
    }

    public function test_execute_with_failing_test_returns_failed(): void
    {
        Http::fake([
            'https://emkc.org/api/v2/piston/execute' => Http::sequence()
                ->push([
                    'run' => ['stdout' => "4\n", 'stderr' => '', 'code' => 0],
                ], 200)
                ->push([
                    'run' => ['stdout' => "5\n", 'stderr' => '', 'code' => 0],
                ], 200),
        ]);

        $response = $this->postJson('/api/code/execute', [
            'language' => 'python',
            'code' => 'a = int(input()); print(a * a)',
            'tests' => [
                ['input' => '2', 'expected' => '5'],
            ],
        ]);

        $response->assertStatus(200);

        $data = $response->json();
        $this->assertCount(1, $data['tests']);
        $this->assertEquals('4', $data['tests'][0]['actual']);
        $this->assertFalse($data['tests'][0]['passed']);
    }

    public function test_execute_validates_required_language(): void
    {
        $response = $this->postJson('/api/code/execute', [
            'code' => 'print("test")',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['language']);
    }

    public function test_execute_validates_language_in_allowed_list(): void
    {
        $response = $this->postJson('/api/code/execute', [
            'language' => 'invalid_lang',
            'code' => 'print("test")',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['language']);
    }

    public function test_execute_validates_required_code(): void
    {
        $response = $this->postJson('/api/code/execute', [
            'language' => 'python',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }

    public function test_execute_validates_code_max_size(): void
    {
        $longCode = str_repeat('a', 65537);

        $response = $this->postJson('/api/code/execute', [
            'language' => 'python',
            'code' => $longCode,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }

    public function test_execute_validates_tests_structure(): void
    {
        $response = $this->postJson('/api/code/execute', [
            'language' => 'python',
            'code' => 'print("test")',
            'tests' => [
                ['input' => '1'],
            ],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['tests.0.expected']);
    }

    public function test_execute_handles_execution_runtime_error(): void
    {
        $response = $this->postJson('/api/code/execute', [
            'language' => 'python',
            'code' => 'raise ValueError("Error en ejecucion simulada")',
        ]);

        $response->assertStatus(200);
        $data = $response->json();
        $this->assertNotEquals(0, $data['exit_code']);
        $this->assertStringContainsString('ValueError', $data['stderr']);
    }

    public function test_execute_handles_syntax_error(): void
    {
        $response = $this->postJson('/api/code/execute', [
            'language' => 'python',
            'code' => 'def invalid syntax (():',
        ]);

        $response->assertStatus(200);
        $data = $response->json();
        $this->assertNotEquals(0, $data['exit_code']);
        $this->assertStringContainsString('SyntaxError', $data['stderr']);
    }

    public function test_rate_limiter_blocks_after_max_requests(): void
    {
        Http::fake([
            'https://emkc.org/api/v2/piston/execute' => Http::response([
                'run' => ['stdout' => "ok\n", 'stderr' => '', 'code' => 0],
            ], 200),
        ]);

        for ($i = 0; $i < 20; $i++) {
            $response = $this->postJson('/api/code/execute', [
                'language' => 'python',
                'code' => 'print("test")',
            ]);
            $response->assertStatus(200);
        }

        $response = $this->postJson('/api/code/execute', [
            'language' => 'python',
            'code' => 'print("test")',
        ]);

        $response->assertStatus(429)
            ->assertJsonStructure(['message', 'error', 'retry_after']);
    }

    public function test_language_registry_returns_correct_structure(): void
    {
        $languages = LanguageRegistry::all();
        $this->assertCount(13, $languages);

        foreach ($languages as $lang) {
            $this->assertArrayHasKey('id', $lang);
            $this->assertArrayHasKey('label', $lang);
            $this->assertArrayHasKey('mode', $lang);
            $this->assertArrayHasKey('sample', $lang);
            $this->assertArrayHasKey('engine', $lang);
            $this->assertContains($lang['engine'], ['local', 'piston']);

            if ($lang['engine'] === 'piston') {
                $this->assertArrayHasKey('piston_runtime', $lang);
                $this->assertArrayHasKey('piston_version', $lang);
            }
        }
    }

    public function test_language_registry_get_returns_correct_language(): void
    {
        $python = LanguageRegistry::get('python');

        $this->assertNotNull($python);
        $this->assertEquals('python', $python['id']);
        $this->assertEquals('Python', $python['label']);
        $this->assertEquals('piston', $python['engine']);
        $this->assertEquals('python', $python['piston_runtime']);

        $javascript = LanguageRegistry::get('javascript');
        $this->assertEquals('piston', $javascript['engine']);
        $this->assertEquals('nodejs', $javascript['piston_runtime']);

        $typescript = LanguageRegistry::get('typescript');
        $this->assertEquals('piston', $typescript['engine']);
        $this->assertEquals('typescript', $typescript['piston_runtime']);

        $php = LanguageRegistry::get('php');
        $this->assertEquals('piston', $php['engine']);
        $this->assertEquals('php', $php['piston_runtime']);

        $pseint = LanguageRegistry::get('pseint');
        $this->assertNotNull($pseint);
        $this->assertEquals('local', $pseint['engine']);
        $this->assertFalse(LanguageRegistry::isPiston('pseint'));
        $this->assertTrue(LanguageRegistry::isLocal('pseint'));
        $this->assertFalse(LanguageRegistry::isLocal('php'));
        $this->assertTrue(LanguageRegistry::isPiston('php'));
    }

    public function test_language_registry_returns_null_for_unknown(): void
    {
        $this->assertNull(LanguageRegistry::get('unknown'));
        $this->assertFalse(LanguageRegistry::isLocal('unknown'));
        $this->assertFalse(LanguageRegistry::isPiston('unknown'));
    }
}
