<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lesson_progress', function (Blueprint $table) {
            if (!Schema::hasColumn('lesson_progress', 'last_code')) {
                $table->text('last_code')->nullable();
            }
            if (!Schema::hasColumn('lesson_progress', 'last_answers')) {
                $table->json('last_answers')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('lesson_progress', function (Blueprint $table) {
            if (Schema::hasColumn('lesson_progress', 'last_code')) {
                $table->dropColumn('last_code');
            }
            if (Schema::hasColumn('lesson_progress', 'last_answers')) {
                $table->dropColumn('last_answers');
            }
        });
    }
};
