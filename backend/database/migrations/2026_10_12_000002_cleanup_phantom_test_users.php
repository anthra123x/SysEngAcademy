<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Nota de Arquitectura (Auditoría Técnica):
     * La lógica destructiva de eliminación de cuentas de prueba y recalculo masivo de XP
     * ha sido trasladada a los comandos de consola Artisan dedicados:
     * - `php artisan app:clean-phantom-users`
     * - `php artisan app:sync-all-user-xp`
     *
     * Las migraciones deben ser estrictamente idempotentes y limitadas a DDL/esquema.
     */
    public function up(): void
    {
        // No-op intencional para preservar el historial de migraciones sin ejecutar DML destructivo en despliegues.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op
    }
};
