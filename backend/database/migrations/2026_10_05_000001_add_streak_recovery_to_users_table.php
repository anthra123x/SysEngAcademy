<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'previous_streak')) {
                $table->integer('previous_streak')->default(0)->after('current_streak');
            }
            if (!Schema::hasColumn('users', 'streak_recovered_at')) {
                $table->timestamp('streak_recovered_at')->nullable()->after('last_activity_date');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'previous_streak')) {
                $table->dropColumn('previous_streak');
            }
            if (Schema::hasColumn('users', 'streak_recovered_at')) {
                $table->dropColumn('streak_recovered_at');
            }
        });
    }
};
