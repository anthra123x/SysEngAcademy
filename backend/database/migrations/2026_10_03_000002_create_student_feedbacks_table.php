<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('student_feedbacks')) {
            Schema::create('student_feedbacks', function (Blueprint $table) {
                $table->id();
                $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('teacher_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('teacher_name')->default('Docente de Cátedra');
                $table->string('type', 50)->default('pedagogical'); // 'pedagogical', 'praise', 'warning_mild', 'warning_strict'
                $table->string('title');
                $table->text('message');
                $table->text('ai_context_summary')->nullable();
                $table->integer('xp_impact')->default(0);
                $table->boolean('is_read')->default(false);
                $table->timestamps();

                $table->index('student_id');
                $table->index('created_at');
                $table->index('type');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('student_feedbacks');
    }
};
