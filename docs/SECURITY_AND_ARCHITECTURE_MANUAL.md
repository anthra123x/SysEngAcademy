# Manual Técnico de Seguridad, Arquitectura y Resiliencia
> **SysEng Academy — Plataforma de Formación Técnica en Ingeniería de Sistemas**  
> *Versión:* 2.0 (Post-Auditoría de Seguridad y Endurecimiento para Producción)  
> *Fecha de emisión:* Octubre 2026  

---

## Índice
1. [Visión General de la Arquitectura de Producción](#1-visión-general-de-la-arquitectura-de-producción)
2. [Vulnerabilidades Críticas Halladas y Patrones Defensivos](#2-vulnerabilidades-críticas-halladas-y-patrones-defensivos)
   - [2.1 Omisión en la Verificación de Contraseñas y Bypass de Login](#21-omisión-en-la-verificación-de-contraseñas-y-bypass-de-login)
   - [2.2 Eliminación de Credenciales Hardcodeadas](#22-eliminación-de-credenciales-hardcodeadas)
   - [2.3 Prevención de Account Takeover en `/auth/sync-session`](#23-prevención-de-account-takeover-en-authsync-session)
   - [2.4 Control de Acceso Roto (RBAC & IDOR) en Foros y Cursos](#24-control-de-acceso-roto-rbac--idor-en-foros-y-cursos)
   - [2.5 Protección de Ejecución de Código Local contra RCE](#25-protección-de-ejecución-de-código-local-contra-rce)
3. [Mecanismos de Resiliencia y Control de Sobrecarga (DoS)](#3-mecanismos-de-resiliencia-y-control-de-sobrecarga-dos)
   - [3.1 Validación Estricta de Tamaño de Payload (256 KB)](#31-validación-estricta-de-tamaño-de-payload-256-kb)
   - [3.2 Rate Limiting Híbrido: IP vs. Identidad Criptográfica de Usuario](#32-rate-limiting-híbrido-ip-vs-identidad-criptográfica-de-usuario)
   - [3.3 Timeouts Activos y Mitigación de Bloqueo en Cascada](#33-timeouts-activos-y-mitigación-de-bloqueo-en-cascada)
4. [Endurecimiento de Cabeceras HTTP y Política de CORS](#4-endurecimiento-de-cabeceras-http-y-política-de-cors)
5. [Guía de Pruebas de Carga y Rendimiento (Load Testing)](#5-guía-de-pruebas-de-carga-y-rendimiento-load-testing)
6. [Hoja de Ruta y Recomendaciones Técnicas a Futuro](#6-hoja-de-ruta-y-recomendaciones-técnicas-a-futuro)

---

## 1. Visión General de la Arquitectura de Producción

SysEng Academy opera mediante una arquitectura híbrida optimizada para alto rendimiento, baja latencia y costos mínimos de infraestructura:

```
[ Cliente Web: Angular SPA ]
        │
        ├── HTTPS / CORS con Cabeceras OWASP
        ▼
[ Gateway Serverless: Vercel Functions (frontend/api/index.ts) ]
        │
        ├── 1. Filtro de Payload (Max 256 KB -> HTTP 413)
        ├── 2. Sliding-Window Limiter (IP / User Hash -> HTTP 429)
        ├── 3. In-Memory Micro-Cache (TTL 20s - 60s)
        │
        ├── Consultas Parameterizadas (SQL Prepared Statements)
        ▼
[ Base de Datos: Neon PostgreSQL Serverless (Pooler US-East-2) ]
        │
        └── Autenticación Bcrypt / Tokens HMAC-SHA256
```

### Componentes Clave:
- **Serverless API Gateway (`frontend/api/index.ts`)**: Recibe las peticiones dirigidas a `/api/*`. Implementa la lógica de autenticación, verificación de inscripciones, telemetría de rachas, gestión de cursos y foros.
- **Neon PostgreSQL**: Base de datos Postgres serverless conectada a través del pooler transaccional (`ep-bitter-fog...pooler...neon.tech`). Las consultas se ejecutan con `@neondatabase/serverless` mediante tagged template literals (`sql`...``), lo que garantiza parametrización nativa y previene inyección SQL.
- **Backend Secundario Laravel (`backend/`)**: Estructura de módulos de soporte y ejecución de pruebas locales de código para ejercicios de programación.

---

## 2. Vulnerabilidades Críticas Halladas y Patrones Defensivos

### 2.1 Omisión en la Verificación de Contraseñas y Bypass de Login
- **El Problema**:
  En el controlador de login original existía un fallo lógico severo:
  ```typescript
  // CÓDIGO VULNERABLE ANTERIOR:
  let userRows = await sql`SELECT * FROM users WHERE LOWER(email) = LOWER(${email}) LIMIT 1`;
  if (!userRows || userRows.length === 0) {
    return sendJson(res, 401, { message: 'Credenciales inválidas.' });
  }
  const dbUser = userRows[0];
  // ¡No se comprobaba si password coincidía con dbUser.password!
  const token = generateSecureToken(dbUser.email, dbUser.id, dbUser.role);
  return sendJson(res, 200, { user: dbUser, token });
  ```
  Cualquier persona que ingresara un correo registrado en el sistema obtenía acceso completo con **cualquier contraseña arbitraria**.
- **La Solución Implementada**:
  Se introdujo `bcryptjs` con una estrategia dual:
  1. Si la contraseña en base de datos empieza con `$2y$`, `$2a$` o `$2b$` (hash bcrypt de Laravel/PHP), se valida usando:
     ```typescript
     passwordValid = bcrypt.compareSync(password, dbPassword);
     ```
  2. Si la cuenta es legada (almacenada temporalmente en texto plano durante migraciones tempranas), se compara usando `timingSafeEqual` para evitar ataques de temporización, y **se migra automáticamente a bcrypt en la misma petición**:
     ```typescript
     if (needsHashUpgrade) {
       const secureHash = bcrypt.hashSync(password, 10);
       await sql`UPDATE users SET password = ${secureHash}, updated_at = NOW() WHERE id = ${dbUser.id}`;
     }
     ```
- **Lección clave**: Nunca des por sentada la presencia de un check de contraseña en endpoints que han sido refactorizados o sincronizados rápidamente. Cada flujo de autenticación debe estar cubierto por pruebas unitarias de login fallido.

---

### 2.2 Eliminación de Credenciales Hardcodeadas
- **El Problema**:
  Existía una excepción codificada directamente en el código para permitir el acceso rápido del docente:
  ```typescript
  // CÓDIGO VULNERABLE ANTERIOR:
  if (email === 'andrescamilomartinez330@gmail.com' && password === 'kimetsunoyaiBa1') { ... }
  ```
  Esto violaba el principio de seguridad OWASP A07 (CWE-798: Uso de credenciales hardcodeadas) y dejaba contraseñas expuestas en repositorios de Git y en el bundle compilado.
- **La Solución Implementada**:
  Se eliminó la bifurcación. El docente ahora se autentica normalmente contra su registro en la base de datos de Neon usando su hash bcrypt estándar.

---

### 2.3 Prevención de Account Takeover en `/auth/sync-session`
- **El Problema**:
  El endpoint `/auth/sync-session` fue diseñado originalmente para sincronizar perfiles locales con la base de datos PostgreSQL, pero permitía que cualquier cliente enviara `{ "email": "victima@correo.com" }` y recibiera un token de sesión válido a nombre de esa víctima sin requerir contraseña ni token previo.
- **La Solución Implementada**:
  Se estableció una regla estricta de autorización:
  1. Si la petición incluye una cabecera `Authorization: Bearer <token>`, se valida que el token pertenezca al mismo usuario (`caller.id === u.id`).
  2. Si no viene token, se exige obligatoriamente la contraseña legítima y se valida con `bcrypt.compareSync`.
  3. Si ninguna de las dos condiciones se cumple, el servidor responde con `HTTP 401 Unauthorized`.

---

### 2.4 Control de Acceso Roto (RBAC & IDOR) en Foros y Cursos
- **El Problema**:
  1. En el foro de cursos, cualquier visitante anónimo podía hacer `POST /api/forum/replies/:id/solution` y marcar respuestas como solución definitiva de preguntas ajenas.
  2. En compras de cursos, un atacante podía intentar invocar `POST /api/enrollments` enviando directamente el ID de un curso de pago.
- **La Solución Implementada**:
  - **RBAC en Foros**:
    ```typescript
    const isPostAuthor = Number(repRows[0].post_author_id) === Number(user.id);
    const isTeacher = user.role === 'admin' || user.role === 'instructor';
    if (!isPostAuthor && !isTeacher) {
      return sendJson(res, 403, { error: 'forbidden', message: 'Solo el autor o docente pueden marcar solución.' });
    }
    ```
  - **Protección Criptográfica en Compras (HMAC-SHA256)**:
    Los cursos de pago no admiten inscripción directa sin un `checkout_token` firmado criptográficamente con `APP_SECRET`:
    ```typescript
    function verifyCheckoutToken(token, userId, courseId): boolean {
      // Verifica userId, courseId, expiración (1 hora) y firma con timingSafeEqual
    }
    ```

---

### 2.5 Protección de Ejecución de Código Local contra RCE
- **El Problema**:
  En [`CodeExecutionController.php`](file:///home/omicron/Documentos/ariscourse/backend/app/Http/Controllers/Api/CodeExecutionController.php), el código enviado por estudiantes en Python, PHP, JS o C era ejecutado localmente mediante `proc_open` sin capas de contención del sistema de archivos.
- **La Solución Implementada**:
  Se añadió el método heurístico `detectSecurityRisk()` que analiza el código antes de la invocación y bloquea:
  - En Python: llamadas a `os.*`, `subprocess.*`, `shutil.*`, `socket.*`, `__import__`, `eval()`, accesos a `/etc/` o `/root/`.
  - En PHP: funciones `exec`, `shell_exec`, `system`, `passthru`, `proc_open`, `unlink`, `rmdir`.
  - En JavaScript: llamadas a `child_process`, `process.exit`, `cluster`, `fs.unlink`.
  - En C/C++: `#include <sys/socket.h>`, `system()`, `fork()`, `execve()`.
  Si se detecta alguna de estas firmas, el servidor bloquea la solicitud con `HTTP 403 Forbidden`.

---

## 3. Mecanismos de Resiliencia y Control de Sobrecarga (DoS)

### 3.1 Validación Estricta de Tamaño de Payload (256 KB)
- **Riesgo**: En arquitecturas serverless como Vercel/AWS Lambda, las funciones tienen un límite de memoria asignado (usualmente 128 MB a 1024 MB). Un atacante que transmita un cuerpo de petición de 50 MB puede provocar un fallo por falta de memoria (Out-Of-Memory) que tumbe la instancia.
- **Mecanismo de Doble Capa Implementado**:
  1. **Capa 1 (Cabecera Content-Length)**: Se inspecciona antes de iniciar la lectura. Si `Content-Length > 262,144 bytes`, se retorna inmediatamente `HTTP 413 Payload Too Large`.
  2. **Capa 2 (Acumulación en Stream)**: Si el cliente omite `Content-Length` o usa `Transfer-Encoding: chunked`, `getBody()` cuenta los bytes recibidos en cada evento `req.on('data')`. Si supera 256 KB, destruye la conexión (`req.destroy()`) y lanza `PayloadTooLargeError`.

### 3.2 Rate Limiting Híbrido: IP vs. Identidad Criptográfica de Usuario
- **El Problema del Rate Limiting tradicional por IP**:
  En instituciones educativas o redes móviles (CGNAT), cientos de estudiantes comparten la misma dirección IP pública. Un límite por IP estricto bloquearía a usuarios legítimos involuntariamente. Al mismo tiempo, un atacante con una botnet o proxies rotativos puede evadir un filtro basado únicamente en IP.
- **Solución: Particionamiento Híbrido de Cuota**:
  ```typescript
  function getClientIdentifier(req: any): string {
    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const raw = authHeader.slice(7).trim();
      // Hash SHA-256 truncado del token para identificar al usuario sin almacenar el token en memoria
      return 'usr_' + createHmac('sha256', APP_SECRET).update(raw).digest('hex').slice(0, 16);
    }
    return getClientIp(req);
  }
  ```
  - **Usuarios Autenticados**: Su cuota está vinculada a su identidad criptográfica (`usr_xxxx`). Aunque 50 estudiantes estén en la misma red Wi-Fi, cada uno tiene su propio contador independiente.
  - **Usuarios Anónimos**: Su cuota está vinculada a su IP pública (`127.0.0.1` o `x-forwarded-for`).

- **Cabeceras Estándar IETF Inyectadas**:
  - `X-RateLimit-Limit`: Cuota máxima permitida en la ventana.
  - `X-RateLimit-Remaining`: Peticiones restantes antes del bloqueo.
  - `X-RateLimit-Reset`: Segundos restantes para el reinicio de la ventana.
  - `Retry-After`: Enviada en respuestas `HTTP 429` indicando cuándo volver a intentar.

### 3.3 Timeouts Activos y Mitigación de Bloqueo en Cascada
En la integración con el modelo de inteligencia artificial (`/api/ai/ask` hacia OpenRouter):
- Se incorporó `signal: AbortSignal.timeout(8000)`. Si la API de OpenAI/OpenRouter experimenta lentitud o congestión, la petición se cancela limpiamente a los 8 segundos, respondiendo con un mensaje amigable y evitando que la lambda de Vercel consuma su tiempo máximo de ejecución de 10-15 segundos.

---

## 4. Endurecimiento de Cabeceras HTTP y Política de CORS

Todas las respuestas del API gateway incluyen las siguientes directivas de seguridad OWASP:

| Cabecera | Valor | Propósito Defensivo |
| :--- | :--- | :--- |
| **`X-Content-Type-Options`** | `nosniff` | Impide que el navegador intente "adivinar" el tipo MIME del contenido, mitigando ataques de ejecución de scripts enmascarados como imágenes o texto. |
| **`X-Frame-Options`** | `DENY` | Evita que la plataforma sea embebida dentro de un `<iframe>` o `<frame>` en sitios externos, neutralizando ataques de Clickjacking. |
| **`Strict-Transport-Security`** | `max-age=31536000; includeSubDomains; preload` | Fuerza a los navegadores a comunicarse exclusivamente mediante HTTPS durante un año, previniendo ataques de tipo Man-in-the-Middle (SSL Stripping). |
| **`Referrer-Policy`** | `strict-origin-when-cross-origin` | Protege la privacidad de las URLs de navegación al enviar solo el origen en solicitudes hacia otros dominios. |
| **`Permissions-Policy`** | `camera=(), microphone=(), geolocation=()` | Desactiva hardware sensible (cámara, micrófono, GPS) en el contexto de la API. |

### Política de CORS Dinámica:
En lugar de permitir `*` con credenciales (lo cual está prohibido por los navegadores modernos y expone información sensible), el sistema evalúa el origen de la petición:
- Si el origen pertenece a dominios autorizados (`sysengacademy.dev`, `frontend-nine-rho-xxvp7yeoqa.vercel.app`, `localhost:4200`), se refleja el origen exacto y se permite `Access-Control-Allow-Credentials: true`.
- Si la petición proviene de un script público o herramienta externa (cURL, Postman), se permite acceso genérico sin credenciales.

---

## 5. Guía de Pruebas de Carga y Rendimiento (Load Testing)

Se han implementado tres herramientas de testing en el directorio [`load-tests/`](file:///home/omicron/Documentos/ariscourse/load-tests):

### Herramienta 1: Runner Nativo en TypeScript / Bun (Sin dependencias externas)
Ubicación: [`load-tests/run-stress-test.ts`](file:///home/omicron/Documentos/ariscourse/load-tests/run-stress-test.ts)
```bash
# Sintaxis: bun run load-tests/run-stress-test.ts [URL_OBJETIVO] [TOTAL_PETICIONES] [CONCURRENCIA]
bun run load-tests/run-stress-test.ts https://frontend-nine-rho-xxvp7yeoqa.vercel.app/api 100 20
```
- **Salida**: Genera un reporte formateado en terminal con la latencia mínima, promedio, percentiles (p50, p90, p95, p99), throughput en req/seg y auditoría de cabeceras en vivo.

### Herramienta 2: Script k6 para Integración Continua (CI/CD)
Ubicación: [`load-tests/k6-stress-test.js`](file:///home/omicron/Documentos/ariscourse/load-tests/k6-stress-test.js)
```bash
k6 run -e TARGET_URL=https://frontend-nine-rho-xxvp7yeoqa.vercel.app/api load-tests/k6-stress-test.js
```
- **Escenarios**: Calentamiento (2 a 15 VUs en 15s), carga sostenida (35 VUs en 30s) y pico de estrés (50 VUs).

### Herramienta 3: Configuración Declarativa para Artillery
Ubicación: [`load-tests/artillery-config.yml`](file:///home/omicron/Documentos/ariscourse/load-tests/artillery-config.yml)
```bash
npx -y artillery run load-tests/artillery-config.yml
```

### Cómo Interpretar los Percentiles de Latencia:
- **p50 (Mediana)**: La experiencia típica del usuario. En SysEng Academy se sitúa entre **160 ms y 260 ms**.
- **p90 / p95**: La latencia en condiciones de alta carga o cuando la base de datos atiende consultas complejas sin caché. Debe mantenerse inferior a **800 ms - 1000 ms**.
- **p99**: Los peores casos (cold starts de serverless lambdas o ráfagas concurrentes). No debe superar los **1500 ms**.

---

## 6. Hoja de Ruta y Recomendaciones Técnicas a Futuro

Para cuando la plataforma continúe escalando en usuarios activos:

1. **Aislamiento en Contenedores para el Ejecutor de Código (`backend/`)**:
   - Aunque `detectSecurityRisk` bloquea los comandos más comunes, si el backend Laravel llega a ejecutarse en un VPS público, se recomienda utilizar un sandbox como **Piston**, **nsjail** o contenedores Docker efímeros sin acceso a red ni privilegios de root (`--network none --memory 128m --cpus 0.5`).
2. **Rate Limiting Distribuido con Upstash Redis**:
   - Actualmente el rate limiter funciona en memoria de la instancia serverless (`Map`). Esto es excelente para mitigar ráfagas locales sin costo. Cuando el tráfico crezca a miles de usuarios simultáneos distribuidos en múltiples nodos de Edge, se puede conectar un store distribuido como **Upstash Redis** para compartir los contadores globalmente entre todas las regiones de Vercel.
3. **Rotación de Secretos de Producción**:
   - Mantener variables de entorno (`APP_SECRET`, `JWT_SECRET`, `AI_API_KEY`) exclusivamente en el panel de Vercel y renovarlas periódicamente.
