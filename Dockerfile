# ==============================================================================
# Dockerfile Raíz para Render / Railway / PaaS
# Construye el backend de Laravel 13 con FrankenPHP + PostgreSQL directamente
# ==============================================================================
FROM dunglas/frankenphp:1-php8.4-alpine

# Instalar extensiones PHP necesarias para Laravel y Neon PostgreSQL
RUN install-php-extensions \
    pdo_pgsql \
    pgsql \
    bcmath \
    opcache \
    zip \
    pcntl \
    intl

# Copiar Composer binario oficial
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copiar manifiestos de dependencias para caché eficiente de Docker
COPY backend/composer.json backend/composer.lock ./

# Instalar dependencias de producción
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader \
    --ignore-platform-reqs

# Copiar el código fuente completo de Laravel
COPY backend/ .

# Finalizar autoloading optimizado
RUN composer dump-autoload --optimize --no-dev --ignore-platform-reqs

# Copiar configuración de Caddyfile y script de entrada
COPY backend/Caddyfile /etc/caddy/Caddyfile
COPY backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint

EXPOSE 8000

ENTRYPOINT ["docker-entrypoint"]
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]
