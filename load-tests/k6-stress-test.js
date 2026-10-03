import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// =============================================================================
// MÉTRICAS PERSONALIZADAS
// =============================================================================
const errorRate = new Rate('custom_error_rate');
const rateLimitedCount = new Counter('rate_limited_429');
const payloadRejectedCount = new Counter('payload_rejected_413');
const coursesLatency = new Trend('courses_latency_ms');
const homeLatency = new Trend('home_latency_ms');
const telemetryLatency = new Trend('telemetry_latency_ms');

// =============================================================================
// CONFIGURACIÓN DE ESCENARIOS Y UMBRALES DE RENDIMIENTO (SLOs)
// =============================================================================
export const options = {
  scenarios: {
    // 1. Carga progresiva y concurrencia sostenida (Ramp-up y Soak)
    sustained_load: {
      executor: 'ramping-vus',
      startVUs: 2,
      stages: [
        { duration: '15s', target: 15 }, // Calentamiento
        { duration: '30s', target: 35 }, // Carga sostenida
        { duration: '15s', target: 50 }, // Pico de estrés
        { duration: '15s', target: 0 },  // Descenso ordenado
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    // 95% de las solicitudes públicas deben responder en menos de 600ms
    'http_req_duration{endpoint:home}': ['p(95)<600'],
    'http_req_duration{endpoint:courses}': ['p(95)<600'],
    'http_req_duration{endpoint:telemetry}': ['p(95)<800'],
    // Tasa de fallos imprevistos (5xx) menor al 1%
    'custom_error_rate': ['rate<0.01'],
  },
};

const BASE_URL = __ENV.TARGET_URL || 'https://frontend-nine-rho-xxvp7yeoqa.vercel.app/api';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Origin': 'https://frontend-nine-rho-xxvp7yeoqa.vercel.app',
};

// =============================================================================
// EJECUCIÓN PRINCIPAL DEL TEST
// =============================================================================
export default function () {
  // ---------------------------------------------------------------------------
  // 1. LECTURA DE ENDPOINTS PÚBLICOS DE ALTA FRECUENCIA (Edge Cached)
  // ---------------------------------------------------------------------------
  group('01. Public High-Traffic Endpoints', function () {
    // GET /home (Agregado optimizado)
    const homeRes = http.get(`${BASE_URL}/home`, {
      headers: JSON_HEADERS,
      tags: { endpoint: 'home' },
    });
    homeLatency.add(homeRes.timings.duration);
    check(homeRes, {
      'Home status es 200': (r) => r.status === 200,
      'Home incluye cursos': (r) => r.body.includes('courses'),
      'Cabecera nosniff presente': (r) => r.headers['X-Content-Type-Options'] === 'nosniff',
    }) || errorRate.add(1);

    sleep(0.3);

    // GET /courses
    const coursesRes = http.get(`${BASE_URL}/courses`, {
      headers: JSON_HEADERS,
      tags: { endpoint: 'courses' },
    });
    coursesLatency.add(coursesRes.timings.duration);
    check(coursesRes, {
      'Courses status es 200': (r) => r.status === 200,
      'Courses devuelve array JSON': (r) => r.body.startsWith('[') || r.body.includes('"data"'),
    }) || errorRate.add(1);

    // GET /categories
    const catRes = http.get(`${BASE_URL}/categories`, { headers: JSON_HEADERS });
    check(catRes, { 'Categories status 200': (r) => r.status === 200 });

    // GET /clans
    const clansRes = http.get(`${BASE_URL}/clans`, { headers: JSON_HEADERS });
    check(clansRes, { 'Clans status 200': (r) => r.status === 200 });
  });

  sleep(0.5);

  // ---------------------------------------------------------------------------
  // 2. TELEMETRÍA Y CONTROL DE RACHAS (Heartbeats concurrentes)
  // ---------------------------------------------------------------------------
  group('02. Telemetry Pulse Concurrency', function () {
    const payload = JSON.stringify({
      delta_seconds: 30,
      action: 'pulse',
      email: 'estudiante@sysengacademy.dev',
    });

    const pingRes = http.post(`${BASE_URL}/user/activity-ping`, payload, {
      headers: JSON_HEADERS,
      tags: { endpoint: 'telemetry' },
    });
    telemetryLatency.add(pingRes.timings.duration);

    if (pingRes.status === 429) {
      rateLimitedCount.add(1);
    } else {
      check(pingRes, {
        'Activity ping status 200 o 429': (r) => r.status === 200 || r.status === 429,
        'Ping responde con JSON válido': (r) => r.body.includes('streak') || r.body.includes('success'),
      }) || errorRate.add(1);
    }
  });

  sleep(0.5);

  // ---------------------------------------------------------------------------
  // 3. PRUEBA DE RESILIENCIA Y SEGURIDAD: CONTROL DE PAYLOADS GIGANTES
  // ---------------------------------------------------------------------------
  group('03. Resilience & Security Protection', function () {
    // Generar un payload intencionalmente superior al límite de 256 KB
    const oversizedBody = JSON.stringify({
      email: 'attacker@evil.com',
      junk_data: 'A'.repeat(280 * 1024), // ~280 KB
    });

    const rejectRes = http.post(`${BASE_URL}/auth/login`, oversizedBody, {
      headers: JSON_HEADERS,
      tags: { endpoint: 'security_payload' },
    });

    if (rejectRes.status === 413) {
      payloadRejectedCount.add(1);
    }

    check(rejectRes, {
      'Payload gigante es rechazado con HTTP 413': (r) => r.status === 413,
      'Respuesta 413 incluye error explicativo': (r) => r.body.includes('payload_too_large'),
    });
  });

  sleep(0.5);
}
