# SysEng Academy 🎓

Plataforma de aprendizaje para estudiantes de Ingeniería de Sistemas: rutas de estudio estructuradas, cursos interactivos y asistente de IA.

## Arquitectura

```
ariscourse/
├── backend/   → API REST Laravel 13 + Sanctum (auth por tokens) + PostgreSQL
└── frontend/  → SPA Angular 22 (standalone, signals) — consumo de la API
```

### Backend (Laravel 13)

- **Auth**: registro/login/logout con Sanctum (tokens Bearer).
- **Dominio**: usuarios (student/instructor/admin), categorías, rutas de aprendizaje con niveles, cursos → módulos → lecciones, quizzes, inscripciones y progreso de lecciones.
- **IA**: servicio multi-proveedor (`App\Services\AiService`) — OpenAI, Gemini o Anthropic. Sin API key usa un placeholder amigable.
- **BD**: PostgreSQL (por defecto Neon en la nube). 19 migraciones + seeders de contenido real.

| Endpoint público | Descripción |
|---|---|
| `POST /api/auth/register` · `POST /api/auth/login` | Registro y login |
| `GET /api/categories` | Categorías |
| `GET /api/learning-paths` · `GET /api/learning-paths/{slug}` | Rutas de aprendizaje |
| `GET /api/courses` · `GET /api/courses/{slug}` | Cursos (con filtros) |
| `GET /api/lessons/{slug}` | Lección (preview público, resto requiere inscripción) |

| Endpoint protegido (`auth:sanctum`) | Descripción |
|---|---|
| `POST /api/auth/logout` · `GET /api/auth/me` | Sesión |
| `GET/POST /api/enrollments` · `POST /api/lessons/{id}/complete` | Inscripciones y progreso |
| `GET/POST /api/ai/conversations...` | Chat con asistente IA |

### Frontend (Angular 22)

- Rutas: `/` (home), `/rutas`, `/cursos`, `/cursos/:slug`, `/asistente` (IA), `/perfil`, `/auth/login`, `/auth/registro`.
- Componentes standalone con señales (`signal`/`computed`), lazy loading y design system propio (variables CSS + SCSS).

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
AI_PROVIDER=openai        # openai | gemini | anthropic | placeholder
AI_API_KEY=tu_key
```

## Testing

```bash
cd backend
php artisan test          # 8 tests: smoke API de autenticación/inscripción/progreso
vendor/bin/pint           # estilo de código (Laravel Pint)
```

Los tests de feature usan la BD configurada (con transacciones de rollback) y requieren haber ejecutado `migrate --seed` previamente.

## Notas de entorno

- La BD Neon responde con latencia de 4–20 s por conexión fría; usar el pooler regional o PostgreSQL local para desarrollo más ágil.
- `phpunit.xml` apunta a la conexión `pgsql` (el build de PHP del entorno no incluye `pdo_sqlite`).