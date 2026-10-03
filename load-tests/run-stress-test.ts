/**
 * SysEng Academy - Synthetic Load & Stress Testing Runner
 * Ejecuta pruebas de concurrencia y latencia midiendo percentiles p50, p90, p95, p99.
 *
 * Uso:
 *   bun run load-tests/run-stress-test.ts [TARGET_URL] [TOTAL_REQUESTS] [CONCURRENCY]
 * Ejemplo:
 *   bun run load-tests/run-stress-test.ts https://frontend-nine-rho-xxvp7yeoqa.vercel.app/api 100 20
 */

const TARGET_URL = (process.argv[2] || process.env.TARGET_URL || 'https://frontend-nine-rho-xxvp7yeoqa.vercel.app/api').replace(/\/+$/, '');
const TOTAL_REQUESTS = Number(process.argv[3] || process.env.TOTAL_REQUESTS || 120);
const CONCURRENCY = Number(process.argv[4] || process.env.CONCURRENCY || 15);

interface RequestResult {
  endpoint: string;
  statusCode: number;
  durationMs: number;
  success: boolean;
  headers: Record<string, string>;
  error?: string;
}

const ENDPOINTS_POOL = [
  { path: '/home', method: 'GET', body: null },
  { path: '/courses', method: 'GET', body: null },
  { path: '/categories', method: 'GET', body: null },
  { path: '/clans', method: 'GET', body: null },
  {
    path: '/user/activity-ping',
    method: 'POST',
    body: JSON.stringify({ delta_seconds: 30, action: 'pulse', email: 'estudiante@sysengacademy.dev' }),
  },
  {
    path: '/auth/login',
    method: 'POST',
    body: JSON.stringify({ email: 'test_audit@syseng.dev', junk: 'X'.repeat(300 * 1024) }), // Test payload limit 413
    isPayloadTest: true,
  },
];

async function executeSingleRequest(spec: typeof ENDPOINTS_POOL[0]): Promise<RequestResult> {
  const url = `${TARGET_URL}${spec.path}`;
  const start = performance.now();

  try {
    const res = await fetch(url, {
      method: spec.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://frontend-nine-rho-xxvp7yeoqa.vercel.app',
      },
      body: spec.body,
      signal: AbortSignal.timeout(12000),
    });

    const durationMs = performance.now() - start;
    const headersMap: Record<string, string> = {};
    res.headers.forEach((val, key) => {
      headersMap[key.toLowerCase()] = val;
    });

    // Consumir el body
    await res.text();

    const isSuccess = spec.isPayloadTest
      ? res.status === 413
      : (res.status >= 200 && res.status < 300) || res.status === 429;

    return {
      endpoint: spec.path,
      statusCode: res.status,
      durationMs,
      success: isSuccess,
      headers: headersMap,
    };
  } catch (err: any) {
    const durationMs = performance.now() - start;
    return {
      endpoint: spec.path,
      statusCode: 0,
      durationMs,
      success: false,
      headers: {},
      error: err?.message || 'Error de red / Timeout',
    };
  }
}

function calculatePercentile(numbers: number[], percentile: number): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return Number(sorted[Math.max(0, index)].toFixed(2));
}

async function run() {
  console.log('='.repeat(78));
  console.log('   SYSENG ACADEMY - SUITE DE AUDITORÍA DE RENDIMIENTO Y ESTRÉS   ');
  console.log('='.repeat(78));
  console.log(`Target:        ${TARGET_URL}`);
  console.log(`Solicitudes:   ${TOTAL_REQUESTS}`);
  console.log(`Concurrencia:  ${CONCURRENCY} workers paralelos`);
  console.log('-'.repeat(78));
  console.log('Iniciando simulación de carga sintética...');

  const startTime = performance.now();
  const results: RequestResult[] = [];
  let requestIndex = 0;

  // Cola de trabajo concurrente
  const worker = async () => {
    while (requestIndex < TOTAL_REQUESTS) {
      const currentIndex = requestIndex++;
      const spec = ENDPOINTS_POOL[currentIndex % ENDPOINTS_POOL.length];
      const res = await executeSingleRequest(spec);
      results.push(res);
      process.stdout.write(res.statusCode === 200 ? '.' : res.statusCode === 429 ? 'R' : res.statusCode === 413 ? 'P' : 'x');
    }
  };

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  const totalTimeSeconds = (performance.now() - startTime) / 1000;
  console.log('\n' + '-'.repeat(78));

  // Análisis estadístico
  const durations = results.map((r) => r.durationMs);
  const statusCodesCount: Record<string, number> = {};
  for (const r of results) {
    const key = String(r.statusCode || 'ERR');
    statusCodesCount[key] = (statusCodesCount[key] || 0) + 1;
  }

  const p50 = calculatePercentile(durations, 50);
  const p90 = calculatePercentile(durations, 90);
  const p95 = calculatePercentile(durations, 95);
  const p99 = calculatePercentile(durations, 99);
  const avg = Number((durations.reduce((a, b) => a + b, 0) / (durations.length || 1)).toFixed(2));
  const min = Math.min(...durations).toFixed(2);
  const max = Math.max(...durations).toFixed(2);
  const rps = Number((TOTAL_REQUESTS / totalTimeSeconds).toFixed(2));

  // Auditoría de Cabeceras de Seguridad detectadas
  const sampleWithHeaders = results.find((r) => Object.keys(r.headers).length > 0);
  const headers = sampleWithHeaders?.headers || {};
  const hasNosniff = headers['x-content-type-options'] === 'nosniff';
  const hasDenyFrame = headers['x-frame-options']?.toLowerCase() === 'deny';
  const hasHsts = Boolean(headers['strict-transport-security']);
  const hasRateLimit = Boolean(headers['x-ratelimit-limit']);

  console.log('\n📊 RESULTADOS DE LATENCIA Y RENDIMIENTO:');
  console.log(`  • Tiempo total de prueba:   ${totalTimeSeconds.toFixed(2)} s`);
  console.log(`  • Throughput alcanzado:     ${rps} req/seg`);
  console.log(`  • Latencia Mínima:          ${min} ms`);
  console.log(`  • Latencia Promedio (Avg):  ${avg} ms`);
  console.log(`  • Percentil 50 (Mediana):   ${p50} ms`);
  console.log(`  • Percentil 90 (p90):       ${p90} ms`);
  console.log(`  • Percentil 95 (p95):       ${p95} ms`);
  console.log(`  • Percentil 99 (p99):       ${p99} ms`);
  console.log(`  • Latencia Máxima:          ${max} ms`);

  console.log('\n📈 DISTRIBUCIÓN DE CÓDIGOS DE RESPUESTA HTTP:');
  for (const [code, count] of Object.entries(statusCodesCount)) {
    const pct = ((count / TOTAL_REQUESTS) * 100).toFixed(1);
    let meaning = '';
    if (code === '200') meaning = '✓ Éxito (Cached/DB OK)';
    else if (code === '429') meaning = '✓ Rate Limiting en acción (Protegido)';
    else if (code === '413') meaning = '✓ Payload gigante rechazado (Seguridad OK)';
    else if (code.startsWith('5')) meaning = '✗ Error 5xx del servidor';
    else meaning = 'Otro';
    console.log(`  • HTTP ${code.padEnd(5)}: ${String(count).padStart(4)} (${pct}%) - ${meaning}`);
  }

  console.log('\n🛡️  AUDITORÍA DE CABECERAS OWASP Y DEFENSA:');
  console.log(`  • X-Content-Type-Options:   ${hasNosniff ? '✓ NOSNIFF (Activo)' : '✗ FALTANTE'}`);
  console.log(`  • X-Frame-Options:          ${hasDenyFrame ? '✓ DENY (Activo)' : '✗ FALTANTE'}`);
  console.log(`  • Strict-Transport-Security:${hasHsts ? '✓ HSTS (Activo)' : '✗ FALTANTE'}`);
  console.log(`  • X-RateLimit-Limit:        ${hasRateLimit ? '✓ CABECERA PRESENTE' : '✗ FALTANTE'}`);

  console.log('='.repeat(78));
}

run();
