<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columnsToDrop = [];

            if (Schema::hasColumn('users', 'current_streak')) {
                $columnsToDrop[] = 'current_streak';
            }
            if (Schema::hasColumn('users', 'previous_streak')) {
                $columnsToDrop[] = 'previous_streak';
            }
            if (Schema::hasColumn('users', 'max_streak')) {
                $columnsToDrop[] = 'max_streak';
            }
            if (Schema::hasColumn('users', 'streak_recovered_at')) {
                $columnsToDrop[] = 'streak_recovered_at';
            }

            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'current_streak')) {
                $table->integer('current_streak')->default(0)->after('role');
            }
            if (!Schema::hasColumn('users', 'previous_streak')) {
                $table->integer('previous_streak')->default(0)->after('current_streak');
            }
            if (!Schema::hasColumn('users', 'max_streak')) {
                $table->integer('max_streak')->default(0)->after('previous_streak');
            }
            if (!Schema::hasColumn('users', 'streak_recovered_at')) {
                $table->timestamp('streak_recovered_at')->nullable()->after('last_activity_date');
            }
        });
    }
};

