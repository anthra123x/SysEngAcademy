# ==============================================================================
# Dockerfile de Producción para SysEng Academy (Laravel 13 + PHP-FPM 8.4 + Nginx)
# Compatible con Render, Railway y cualquier PaaS / VPS
# ==============================================================================
FROM php:8.4-fpm-alpine

# Instalar dependencias del sistema, Nginx, Supervisor y extensiones nativas
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    libzip-dev \
    postgresql-dev \
    icu-dev \
    oniguruma-dev

# Instalar extensiones PHP requeridas por Laravel y PostgreSQL
RUN docker-php-ext-install \
    pdo_pgsql \
    pgsql \
    bcmath \
    opcache \
    zip \
    intl \
    pcntl

# Copiar Composer binario oficial
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copiar manifiestos e instalar dependencias de producción
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader \
    --ignore-platform-reqs

# Copiar código fuente
COPY . .

# Generar autoload optimizado
RUN composer dump-autoload --optimize --no-dev --ignore-platform-reqs

# Copiar configuraciones de Nginx, Supervisor y Entrypoint
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint

EXPOSE 8000 10000

ENTRYPOINT ["docker-entrypoint"]
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisord.conf"]
