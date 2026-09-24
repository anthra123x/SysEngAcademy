# SysEng Academy 🎓

Plataforma de aprendizaje para estudiantes de Ingeniería de Sistemas: rutas de estudio estructuradas, cursos interactivos y asistente de IA.

## Arquitectura

```
ariscourse/
├── backend/   → API REST Laravel 13 + auth JWT stateless (con fallback Sanctum) + PostgreSQL
└── frontend/  → SPA Angular 22 (standalone, signals) — consumo de la API
```

### Backend (Laravel 13)

- **Auth**: registro/login/logout con **JWT stateless** (HS256, `firebase/php-jwt`). El guard `jwt` se consulta primero en rutas protegidas (`auth:jwt,sanctum`): no toca la BD por token (ideal con bases frías como Neon) y resuelve el usuario con caché de perfiles; `sanctum` queda como fallback para tokens legados y tests. El logout revoca el JWT vía blacklist en caché.
- **Rendimiento**: caché de respuestas en **archivo** (`CACHE_STORE=file`) para contenido público (categorías, rutas, cursos, home) con TTLs de 5 min a 24 h. El endpoint **`GET /api/home`** agrega categorías + rutas + cursos en **una sola llamada** cacheada. Los seeders hacen `Cache::flush()` al final para que el contenido nuevo invalide la caché.
- **Dominio**: usuarios (student/instructor/admin), categorías, rutas de aprendizaje con niveles, cursos → módulos → lecciones, quizzes, inscripciones y progreso de lecciones.
- **IA**: servicio multi-proveedor (`App\Services\AiService`) — OpenAI, Gemini o Anthropic (en producción: OpenRouter). El chat soporta **streaming SSE** (`POST /api/ai/conversations/{id}/stream`) para mostrar la respuesta token a token.
- **BD**: PostgreSQL (por defecto Neon en la nube). 19 migraciones + seeders de contenido real.

| Endpoint público | Descripción |
|---|---|
| `POST /api/auth/register` · `POST /api/auth/login` | Registro y login (emite JWT) |
| `GET /api/home` | **Datos agregados del home** (categorías + rutas + cursos destacados, cacheado) |
| `GET /api/categories` | Categorías |
| `GET /api/learning-paths` · `GET /api/learning-paths/{slug}` | Rutas de aprendizaje |
| `GET /api/courses` · `GET /api/courses/{slug}` | Cursos (con filtros) |
| `GET /api/lessons/{slug}` | Lección (preview público, resto requiere inscripción) |

| Endpoint protegido (`auth:jwt,sanctum`) | Descripción |
|---|---|
| `POST /api/auth/logout` · `GET /api/auth/me` | Sesión (logout revoca el JWT) |
| `GET/POST /api/enrollments` · `POST /api/lessons/{id}/complete` | Inscripciones y progreso |
| `GET/POST /api/ai/conversations...` · `POST .../stream` | Chat con asistente IA (streaming SSE) |

### Frontend (Angular 22)

- Rutas: `/` (home), `/rutas`, `/cursos`, `/cursos/:slug`, `/asistente` (IA), `/perfil`, `/auth/login`, `/auth/registro`.
- Componentes standalone con señales (`signal`/`computed`), lazy loading y design system propio (variables CSS + SCSS).
- El home consume **un solo endpoint** (`/api/home`); el chat IA consume el streaming SSE por `fetch` y renderiza la respuesta token a token con cursor de escritura.

## Requisitos

- PHP ≥ 8.3 (con `pdo_pgsql`) · Composer
- PostgreSQL (o Neon en la nube)
- Bun ≥ 1.4 (o Node 22+)

## Montaje

```bash
# 1) Backend
cd backend
composer install
cp .env.example .env        # configura DB, AI_PROVIDER, etc.
php artisan key:generate
php artisan migrate --seed  # esquema + contenido de ejemplo
php artisan serve           # http://localhost:8000

# 2) Frontend (otra terminal)
cd frontend
bun install
bun run start               # http://localhost:4200
```

### Usuarios de ejemplo (seed)

| Rol | Email | Password |
|---|---|---|
| Admin | `admin@sysengacademy.dev` | `admin1234` |
| Instructor | `instructor@sysengacademy.dev` | `instructor1234` |
| Estudiante | `estudiante@sysengacademy.dev` | `estudiante1234` |

### Asistente de IA

Para activarlo, configurar en `.env`:

```
AI_PROVIDER=openai        # openai | gemini | anthropic | placeholder | openrouter
AI_API_KEY=tu_key
```

Con `AI_PROVIDER=openrouter` el chat puede consumir el endpoint en streaming:

```
POST /api/ai/conversations/{id}/stream   →  text/event-stream (SSE)
```

## Testing

```bash
cd backend
php artisan test          # 10 tests: smoke API, home agregado, JWT/login/logout
vendor/bin/pint           # estilo de código (Laravel Pint)
```

Los tests de feature usan la BD configurada (con transacciones de rollback) y requieren haber ejecutado `migrate --seed` previamente.

## Notas de entorno

- La BD Neon responde con latencia de 4–20 s por conexión fría y puede quedar inaccesible unos minutos si el compute escala a cero; usar el pooler regional o PostgreSQL local para desarrollo más ágil. El caché de respuestas (`CACHE_STORE=file`) mitiga el impacto en contenido público siempre que la caché esté tibia.
- `phpunit.xml` apunta a la conexión `pgsql` (el build de PHP del entorno no incluye `pdo_sqlite`).
- **JWT**: `JWT_TTL` (minutos, por defecto 10080 = 7 días) y `JWT_SECRET` (opcional; si no se define usa `APP_KEY`).
- No cachear modelos Eloquent en el store de archivo: el `FileStore` no deserializa objetos (`__PHP_Incomplete_Class`). Cachear siempre arrays planos (`->toArray()`).