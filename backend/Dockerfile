# ==============================================================================
# Dockerfile de Producción para SysEng Academy (Laravel 13 + FrankenPHP + PostgreSQL)
# Diseñado para despliegue de alto rendimiento en Render, Railway o Fly.io
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
COPY composer.json composer.lock ./

# Instalar dependencias de producción
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader \
    --ignore-platform-reqs

# Copiar el código fuente completo de Laravel
COPY . .

# Finalizar autoloading optimizado
RUN composer dump-autoload --optimize --no-dev --ignore-platform-reqs

# Copiar configuración de Caddyfile y script de entrada
COPY Caddyfile /etc/caddy/Caddyfile
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint

EXPOSE 8000

ENTRYPOINT ["docker-entrypoint"]
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]
