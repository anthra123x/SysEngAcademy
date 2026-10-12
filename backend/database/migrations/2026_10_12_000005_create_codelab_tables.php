<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Challenges table
        Schema::create('codelab_challenges', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->text('description');
            $table->enum('difficulty', ['facil', 'media', 'dificil', 'hardcore'])->default('media');
            $table->decimal('acceptance_rate', 5, 2)->default(100.00);
            $table->integer('xp')->default(50);
            $table->enum('category', ['algoritmos', 'estructuras', 'concurrencia', 'so', 'bd', 'compiladores'])->default('algoritmos');
            $table->jsonb('tags')->nullable();
            $table->jsonb('languages')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('author_name')->default('SysEng Faculty');
            $table->string('author_username')->default('syseng');
            $table->string('author_role')->default('Curaduría Oficial');
            $table->string('author_avatar')->nullable();
            $table->boolean('is_official')->default(false);
            $table->boolean('is_community')->default(true);
            $table->boolean('is_spotlight')->default(false);
            $table->integer('upvotes')->default(0);
            $table->integer('comments_count')->default(0);
            $table->jsonb('starter_code')->nullable();
            $table->jsonb('solution_preview')->nullable();
            $table->string('status')->default('active'); // active, archived, draft
            $table->timestamps();

            $table->index(['difficulty', 'category']);
            $table->index(['is_community', 'is_official']);
            $table->index('upvotes');
        });

        // 2. Test Cases table
        Schema::create('codelab_test_cases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_id')->constrained('codelab_challenges')->cascadeOnDelete();
            $table->text('input')->nullable();
            $table->text('expected_output');
            $table->boolean('is_hidden')->default(false);
            $table->string('label')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index(['challenge_id', 'is_hidden']);
        });

        // 3. Submissions table
        Schema::create('codelab_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_id')->constrained('codelab_challenges')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('language');
            $table->text('code');
            $table->enum('status', ['passed', 'failed', 'error'])->default('failed');
            $table->integer('execution_time_ms')->default(0);
            $table->decimal('memory_mb', 6, 2)->nullable();
            $table->integer('passed_cases')->default(0);
            $table->integer('total_cases')->default(0);
            $table->text('stdout')->nullable();
            $table->text('stderr')->nullable();
            $table->timestamps();

            $table->index(['challenge_id', 'status']);
            $table->index(['user_id', 'challenge_id']);
        });

        // 4. Votes table
        Schema::create('codelab_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_id')->constrained('codelab_challenges')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->unique(['challenge_id', 'user_id']);
            $table->index(['challenge_id', 'ip_address']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('codelab_votes');
        Schema::dropIfExists('codelab_submissions');
        Schema::dropIfExists('codelab_test_cases');
        Schema::dropIfExists('codelab_challenges');
    }
};
