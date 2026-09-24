# SysEng Academy — Frontend 🎓

SPA del frontend de **SysEng Academy**: plataforma de aprendizaje para estudiantes de Ingeniería de Sistemas.

- **Framework**: Angular 22 (standalone components + signals)
- **Estilos**: design system propio (variables CSS + SCSS)
- **Rendimiento**: lazy loading por ruta; home con **una sola llamada** a `GET /api/home`; chat IA con streaming SSE token a token

> 📖 Documentación general del proyecto (arquitectura, montaje, usuarios seed): [README raíz](../README.md)

## Scripts

| Comando | Descripción |
|---|---|
| `bun run start` | Servidor de desarrollo → http://localhost:4200 (hot reload) |
| `bun run build` | Compilación de producción (`dist/`) |
| `bun run watch` | Build de desarrollo con watch |
| `bun run test` | Tests unitarios (Karma) |

> Requiere **Bun ≥ 1.4** (o Node 22+; `packageManager: bun@1.4.2`).

## Rutas

| Ruta | Página |
|---|---|
| `/` | Home (categorías + rutas + cursos destacados desde `/api/home`) |
| `/rutas` | Rutas de aprendizaje |
| `/cursos` · `/cursos/:slug` | Catálogo y detalle de curso |
| `/asistente` | Chat con asistente de IA (streaming SSE) |
| `/perfil` | Perfil e inscripciones del usuario |
| `/auth/login` · `/auth/registro` | Autenticación (JWT) |

## Estructura

```
src/app/
├── app.routes.ts   → definición de rutas con lazy loading
├── core/           → servicios, guards y utilidades compartidas
├── features/       → páginas y componentes por funcionalidad
└── layout/         → shell de la aplicación (header, footer, navegación)
```

## Consumo de API

- Endpoints en el backend Laravel (`http://localhost:8000` por defecto, configurable vía proxy/environment).
- El home carga en una sola petición (`GET /api/home`, cacheada en backend).
- El asistente lee `POST /api/ai/conversations/{id}/stream` con `fetch` y renderiza la respuesta en streaming con cursor de escritura.