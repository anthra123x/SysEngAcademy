<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_paths', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('difficulty', ['beginner', 'intermediate', 'advanced', 'expert'])->default('beginner');
            $table->string('thumbnail')->nullable();
            $table->boolean('is_published')->default(false);
            $table->integer('estimated_hours')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learning_paths');
    }
};
