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
        Schema::table('lessons', function (Blueprint $table) {
            $table->string('language', 20)->nullable()->after('type');
            $table->longText('starter_code')->nullable()->after('language');
            $table->longText('solution')->nullable()->after('starter_code');
            $table->json('test_cases')->nullable()->after('solution');
            $table->text('hint')->nullable()->after('test_cases');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn(['language', 'starter_code', 'solution', 'test_cases', 'hint']);
        });
    }
};
