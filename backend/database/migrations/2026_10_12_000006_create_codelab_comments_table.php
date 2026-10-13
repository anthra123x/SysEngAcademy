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
        Schema::create('codelab_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_id')->constrained('codelab_challenges')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('author_name');
            $table->string('author_username');
            $table->string('author_role')->default('Estudiante');
            $table->string('author_avatar')->nullable();
            $table->boolean('is_ai')->default(false);
            $table->text('content');
            $table->text('code_snippet')->nullable();
            $table->integer('upvotes')->default(0);
            $table->timestamps();

            $table->index(['challenge_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('codelab_comments');
    }
};
