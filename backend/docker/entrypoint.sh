#!/bin/sh
set -e

echo "=== Arrancando SysEng Academy Laravel Backend (Nginx + PHP-FPM) ==="

PORT=${PORT:-8000}
echo "Configurando puerto Nginx en $PORT..."
sed -i "s/PORT_PLACEHOLDER/$PORT/g" /etc/nginx/http.d/default.conf

# Permisos para storage y caché
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chmod -R 777 storage bootstrap/cache

if [ "$APP_ENV" = "production" ]; then
    echo "Optimizando configuración, rutas y vistas..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

if [ -n "$DB_HOST" ] || [ -n "$DATABASE_URL" ]; then
    echo "Ejecutando migraciones de base de datos..."
    php artisan migrate --force || echo "Aviso: No se pudieron ejecutar migraciones automáticas al iniciar."
fi

echo "Iniciando Nginx y PHP-FPM en puerto $PORT..."
exec "$@"
