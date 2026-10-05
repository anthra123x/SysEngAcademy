<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_feedbacks', function (Blueprint $table) {
            if (!Schema::hasColumn('student_feedbacks', 'status')) {
                $table->string('status', 30)->default('active')->after('xp_impact');
            }
            if (!Schema::hasColumn('student_feedbacks', 'is_resolved')) {
                $table->boolean('is_resolved')->default(false)->after('status');
            }
            if (!Schema::hasColumn('student_feedbacks', 'resolved_at')) {
                $table->timestamp('resolved_at')->nullable()->after('is_resolved');
            }
            if (!Schema::hasColumn('student_feedbacks', 'is_dismissed')) {
                $table->boolean('is_dismissed')->default(false)->after('resolved_at');
            }
            if (!Schema::hasColumn('student_feedbacks', 'dismissed_at')) {
                $table->timestamp('dismissed_at')->nullable()->after('is_dismissed');
            }
            if (!Schema::hasColumn('student_feedbacks', 'remediation_action')) {
                $table->string('remediation_action')->nullable()->after('dismissed_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('student_feedbacks', function (Blueprint $table) {
            if (Schema::hasColumn('student_feedbacks', 'status')) {
                $table->dropColumn('status');
            }
            if (Schema::hasColumn('student_feedbacks', 'is_resolved')) {
                $table->dropColumn('is_resolved');
            }
            if (Schema::hasColumn('student_feedbacks', 'resolved_at')) {
                $table->dropColumn('resolved_at');
            }
            if (Schema::hasColumn('student_feedbacks', 'is_dismissed')) {
                $table->dropColumn('is_dismissed');
            }
            if (Schema::hasColumn('student_feedbacks', 'dismissed_at')) {
                $table->dropColumn('dismissed_at');
            }
            if (Schema::hasColumn('student_feedbacks', 'remediation_action')) {
                $table->dropColumn('remediation_action');
            }
        });
    }
};
