<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Agregar rating_avg y rating_count en courses si no existen
        Schema::table('courses', function (Blueprint $table) {
            if (!Schema::hasColumn('courses', 'rating_avg')) {
                $table->decimal('rating_avg', 3, 2)->default(4.90)->after('difficulty');
            }
            if (!Schema::hasColumn('courses', 'rating_count')) {
                $table->unsignedInteger('rating_count')->default(0)->after('rating_avg');
            }
        });

        // 2. Crear tabla de calificaciones y reseñas de cursos
        if (!Schema::hasTable('course_reviews')) {
            Schema::create('course_reviews', function (Blueprint $table) {
                $table->id();
                $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->unsignedTinyInteger('rating'); // 1 a 5
                $table->text('comment')->nullable();
                $table->timestamps();

                $table->unique(['course_id', 'user_id']);
                $table->index(['course_id', 'created_at']);
                $table->index('rating');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('course_reviews');

        Schema::table('courses', function (Blueprint $table) {
            if (Schema::hasColumn('courses', 'rating_count')) {
                $table->dropColumn('rating_count');
            }
            if (Schema::hasColumn('courses', 'rating_avg')) {
                $table->dropColumn('rating_avg');
            }
        });
    }
};
