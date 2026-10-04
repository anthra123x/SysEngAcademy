#!/bin/sh
set -e

echo "=== Arrancando SysEng Academy Laravel Backend ==="

# Asegurar permisos correctos en carpetas de almacenamiento y caché
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Optimización de arranque en producción
if [ "$APP_ENV" = "production" ]; then
    echo "Optimizando configuración, rutas y vistas..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

# Ejecutar migraciones pendientes de forma segura si la BD está disponible
if [ -n "$DB_HOST" ] || [ -n "$DATABASE_URL" ]; then
    echo "Ejecutando migraciones de base de datos..."
    php artisan migrate --force || echo "Aviso: No se pudieron ejecutar migraciones automáticas al iniciar."
fi

echo "Iniciando servidor web en el puerto ${PORT:-8000}..."
exec "$@"
