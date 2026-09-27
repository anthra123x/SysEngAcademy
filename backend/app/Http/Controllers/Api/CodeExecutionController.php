<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LanguageRegistry;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class CodeExecutionController extends Controller
{
    private const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

    private const MAX_CODE_SIZE = 65536;

    private const REQUEST_TIMEOUT = 15;

    private const RATE_LIMIT_MAX = 20;

    private const RATE_LIMIT_DECAY = 60;

    public function languages(): JsonResponse
    {
        return response()->json(LanguageRegistry::all());
    }

    public function execute(Request $request): JsonResponse
    {
        $key = $this->rateLimitKey($request);
        $executed = RateLimiter::attempt(
            $key,
            self::RATE_LIMIT_MAX,
            fn () => $this->executeCode($request),
            self::RATE_LIMIT_DECAY
        );

        if (! $executed) {
            return response()->json([
                'message' => 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
                'error' => 'rate_limited',
                'retry_after' => RateLimiter::availableIn($key),
            ], 429);
        }

        return $executed;
    }

    private function executeCode(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'language' => ['required', 'string', 'in:'.implode(',', array_keys(LanguageRegistry::keyed()))],
            'code' => ['required', 'string', 'max:'.self::MAX_CODE_SIZE],
            'stdin' => ['nullable', 'string', 'max:'.self::MAX_CODE_SIZE],
            'tests' => ['nullable', 'array'],
            'tests.*.input' => ['nullable', 'string'],
            'tests.*.expected' => ['required_with:tests.*.input', 'string'],
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $language = $request->string('language')->value();
        $code = $request->string('code')->value();
        $stdin = $request->string('stdin')->value();
        $tests = $request->input('tests', []);

        if (LanguageRegistry::isLocal($language)) {
            return response()->json([
                'stdout' => '',
                'stderr' => '',
                'exit_code' => 0,
                'tests' => [],
                'execution_time_ms' => 0,
                'language' => $language,
                'engine' => 'local',
                'message' => 'PSeInt se ejecuta localmente en el navegador.',
            ], 200);
        }

        $startTime = microtime(true);
        $result = $this->runLocally($language, $code, $stdin);
        $executionTimeMs = (int) round((microtime(true) - $startTime) * 1000);

        $testResults = [];
        if (!empty($tests)) {
            $testResults = $this->runLocalTests($language, $code, $tests);
        }

        return response()->json([
            'stdout' => $result['stdout'],
            'stderr' => $result['stderr'],
            'exit_code' => $result['exit_code'],
            'tests' => $testResults,
            'execution_time_ms' => $executionTimeMs,
            'language' => $language,
        ]);
    }

    private function runLocally(string $language, string $code, ?string $stdin = null): array
    {
        $tempDir = sys_get_temp_dir() . '/syseng_code_' . bin2hex(random_bytes(8));
        if (!@mkdir($tempDir, 0700, true)) {
            return ['stdout' => '', 'stderr' => 'No se pudo inicializar el entorno de ejecución temporal.', 'exit_code' => 1];
        }

        try {
            $fileName = $this->getMainFileName($language);
            $filePath = $tempDir . '/' . $fileName;
            file_put_contents($filePath, $code);

            $command = match ($language) {
                'python' => 'python3 ' . escapeshellarg($fileName),
                'javascript' => 'node ' . escapeshellarg($fileName),
                'typescript' => (file_exists('/home/omicron/.bun/bin/bun') ? '/home/omicron/.bun/bin/bun run ' : 'node ') . escapeshellarg($fileName),
                'php' => 'php ' . escapeshellarg($fileName),
                'c' => 'gcc -O2 ' . escapeshellarg($fileName) . ' -o app && ./app',
                'cpp' => 'g++ -O2 ' . escapeshellarg($fileName) . ' -o app && ./app',
                default => 'cat ' . escapeshellarg($fileName),
            };

            return $this->executeProcess($command, $tempDir, $stdin);
        } finally {
            $this->cleanTempDir($tempDir);
        }
    }

    private function executeProcess(string $command, string $cwd, ?string $stdin = null, int $timeoutSeconds = 5): array
    {
        $descriptors = [
            0 => ['pipe', 'r'],
            1 => ['pipe', 'w'],
            2 => ['pipe', 'w'],
        ];

        $process = proc_open($command, $descriptors, $pipes, $cwd, [
            'PATH' => '/home/omicron/.bun/bin:/home/omicron/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/bin',
        ]);

        if (!is_resource($process)) {
            return ['stdout' => '', 'stderr' => 'No se pudo iniciar el proceso de ejecución.', 'exit_code' => 1];
        }

        if ($stdin !== null && $stdin !== '') {
            fwrite($pipes[0], $stdin);
        }
        fclose($pipes[0]);

        stream_set_blocking($pipes[1], false);
        stream_set_blocking($pipes[2], false);

        $stdout = '';
        $stderr = '';
        $start = microtime(true);
        $timedOut = false;

        while (true) {
            $read = [$pipes[1], $pipes[2]];
            $write = null;
            $except = null;

            if (stream_select($read, $write, $except, 0, 50000) > 0) {
                foreach ($read as $stream) {
                    if ($stream === $pipes[1]) {
                        $stdout .= fread($pipes[1], 4096);
                    } elseif ($stream === $pipes[2]) {
                        $stderr .= fread($pipes[2], 4096);
                    }
                }
            }

            $status = proc_get_status($process);
            if (!$status['running']) {
                break;
            }

            if ((microtime(true) - $start) > $timeoutSeconds) {
                $timedOut = true;
                proc_terminate($process, 9);
                break;
            }
        }

        $stdout .= stream_get_contents($pipes[1]);
        $stderr .= stream_get_contents($pipes[2]);
        fclose($pipes[1]);
        fclose($pipes[2]);

        $exitCode = $timedOut ? 124 : proc_close($process);

        if ($timedOut) {
            $stderr .= "\n[Tiempo de ejecución agotado (> {$timeoutSeconds}s). Revisa si existe un bucle infinito en tu código.]";
        }

        return [
            'stdout' => mb_substr($stdout, 0, 32768),
            'stderr' => mb_substr($stderr, 0, 32768),
            'exit_code' => $exitCode,
        ];
    }

    private function runLocalTests(string $language, string $code, array $tests): array
    {
        $results = [];

        foreach ($tests as $test) {
            $input = $test['input'] ?? '';
            $expected = trim($test['expected'] ?? '');

            $res = $this->runLocally($language, $code, $input);
            $actual = trim($res['stdout']);
            $passed = $actual === $expected && $res['exit_code'] === 0;

            $results[] = [
                'input' => $input,
                'expected' => $expected,
                'actual' => $actual,
                'passed' => $passed,
            ];
        }

        return $results;
    }

    private function cleanTempDir(string $dir): void
    {
        if (!is_dir($dir)) return;
        $files = array_diff(scandir($dir) ?: [], ['.', '..']);
        foreach ($files as $file) {
            @unlink("$dir/$file");
        }
        @rmdir($dir);
    }

    private function handlePistonError(Response $response, string $language, int $executionTimeMs): JsonResponse
    {
        $status = $response->status();
        $body = $response->json();

        $message = match ($status) {
            400 => 'Solicitud inválida al servicio de ejecución.',
            404 => 'Lenguaje o versión no soportada.',
            422 => 'Error de validación en el servicio de ejecución.',
            429 => 'Límite de tasa excedido en el servicio de ejecución.',
            500, 502, 503 => 'Error interno del servicio de ejecución.',
            default => 'Error desconocido en el servicio de ejecución.',
        };

        if (isset($body['message'])) {
            $message = $body['message'];
        }

        return response()->json([
            'message' => $message,
            'error' => 'piston_error',
            'details' => $body,
            'execution_time_ms' => $executionTimeMs,
        ], 502);
    }

    private function getMainFileName(string $language): string
    {
        return match ($language) {
            'php' => 'main.php',
            'python' => 'main.py',
            'javascript' => 'main.js',
            'typescript' => 'main.ts',
            'c' => 'main.c',
            'cpp' => 'main.cpp',
            'java' => 'Main.java',
            'sql' => 'main.sql',
            'bash' => 'main.sh',
            default => 'main.txt',
        };
    }

    private function rateLimitKey(Request $request): string
    {
        if ($request->user()) {
            return 'code-exec:user:'.$request->user()->getKey();
        }

        return 'code-exec:ip:'.$request->ip();
    }
}
