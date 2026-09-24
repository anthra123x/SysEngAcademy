<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('instructor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('thumbnail')->nullable();
            $table->boolean('is_published')->default(false);
            $table->boolean('is_free')->default(true);
            $table->integer('duration_hours')->default(0);
            $table->enum('difficulty', ['beginner', 'intermediate', 'advanced', 'expert'])->default('beginner');
            $table->foreignId('learning_path_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('learning_path_level_id')->nullable()->constrained('learning_path_levels')->nullOnDelete();
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
