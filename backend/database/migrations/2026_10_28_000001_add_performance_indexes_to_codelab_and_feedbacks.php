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
        Schema::table('student_feedbacks', function (Blueprint $table) {
            $table->index(['student_id', 'is_dismissed'], 'idx_feedbacks_student_dismissed');
            $table->index(['student_id', 'is_resolved'], 'idx_feedbacks_student_resolved');
        });

        Schema::table('codelab_challenges', function (Blueprint $table) {
            $table->index(['is_spotlight', 'upvotes'], 'idx_challenges_spotlight_upvotes');
            $table->index(['user_id', 'created_at'], 'idx_challenges_user_created');
        });

        Schema::table('codelab_submissions', function (Blueprint $table) {
            $table->index(['user_id', 'status', 'challenge_id'], 'idx_submissions_user_status_ch');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_feedbacks', function (Blueprint $table) {
            $table->dropIndex('idx_feedbacks_student_dismissed');
            $table->dropIndex('idx_feedbacks_student_resolved');
        });

        Schema::table('codelab_challenges', function (Blueprint $table) {
            $table->dropIndex('idx_challenges_spotlight_upvotes');
            $table->dropIndex('idx_challenges_user_created');
        });

        Schema::table('codelab_submissions', function (Blueprint $table) {
            $table->dropIndex('idx_submissions_user_status_ch');
        });
    }
};
