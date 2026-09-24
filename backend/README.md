# SysEng Academy — Backend 🎓

API REST del backend de **SysEng Academy**: plataforma de aprendizaje para estudiantes de Ingeniería de Sistemas.

- **Framework**: Laravel 13 (PHP ≥ 8.3)
- **Base de datos**: PostgreSQL (por defecto Neon en la nube)
- **Auth**: JWT stateless (HS256, `firebase/php-jwt`) con fallback a Sanctum
- **IA**: servicio multi-proveedor con streaming SSE (`App\Services\AiService`)

> 📖 Documentación general del proyecto (arquitectura, montaje, usuarios seed): [README raíz](../README.md)

## Estructura

```
app/
├── Auth/      → guards, middlewares y lógica de autenticación JWT
├── Http/      → controllers, requests y recursos
├── Models/    → Eloquent: User, Category, LearningPath, Course, Module, Lesson, Quiz…
├── Providers/ → service providers de la aplicación
└── Services/  → AiService (multi-proveedor) y servicios de dominio
```

## Montaje

```bash
composer install
cp .env.example .env   # configura DB_*, AI_PROVIDER, AI_API_KEY…
php artisan key:generate
php artisan migrate --seed   # 15 migraciones + seeders de contenido real
php artisan serve            # http://localhost:8000
```

## Variables de entorno clave

| Variable | Descripción |
|---|---|
| `DB_*` | Conexión PostgreSQL (host, puerto, base, usuario, password, `DB_SSLMODE`) |
| `AI_PROVIDER` | `openai` \| `gemini` \| `anthropic` \| `placeholder` \| `openrouter` |
| `AI_API_KEY` · `AI_MODEL` · `AI_SYSTEM_PROMPT` | Configuración del proveedor de IA |
| `CACHE_STORE` | Store de caché (`file` por defecto; contenido público cacheado 5 min – 24 h) |
| `FRONTEND_URL` | Origen permitido para CORS (SPA Angular) |
| `JWT_TTL` / `JWT_SECRET` | Minutos de validez del JWT (default 10080) y secreto (por defecto usa `APP_KEY`) |

## Testing

```bash
php artisan test        # 14 tests: ApiSmokeTest, JwtGuardTest + unitarios
vendor/bin/pint         # estilo de código (Laravel Pint)
```

Los tests de feature usan la BD configurada (`phpunit.xml` → conexión `pgsql`) con transacciones de rollback; ejecuta `php artisan migrate --seed` antes. Con Neon frío las conexiones tardan 4–20 s y pueden fallar si el compute está en cero.

## Notas

- No cachear modelos Eloquent en `FileStore` (no deserializa objetos): cachear siempre arrays planos (`->toArray()`).
- El logout revoca el JWT vía blacklist en caché.
- Endpoints públicos/protegidos documentados en el [README raíz](../README.md#backend-laravel-13).