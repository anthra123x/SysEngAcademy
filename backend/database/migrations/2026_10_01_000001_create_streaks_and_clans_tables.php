<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Campos de racha, tiempo de estudio y nivel en tabla users
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'current_streak')) {
                $table->integer('current_streak')->default(1)->after('role');
            }
            if (!Schema::hasColumn('users', 'max_streak')) {
                $table->integer('max_streak')->default(1)->after('current_streak');
            }
            if (!Schema::hasColumn('users', 'last_activity_date')) {
                $table->date('last_activity_date')->nullable()->after('max_streak');
            }
            if (!Schema::hasColumn('users', 'today_study_seconds')) {
                $table->integer('today_study_seconds')->default(0)->after('last_activity_date');
            }
            if (!Schema::hasColumn('users', 'total_study_seconds')) {
                $table->integer('total_study_seconds')->default(0)->after('today_study_seconds');
            }
            if (!Schema::hasColumn('users', 'xp')) {
                $table->integer('xp')->default(50)->after('total_study_seconds');
            }
            if (!Schema::hasColumn('users', 'specialization')) {
                $table->string('specialization')->nullable()->after('xp');
            }
        });

        // 2. Tabla de actividades diarias para racha y telemetría de estudio
        if (!Schema::hasTable('user_daily_activities')) {
            Schema::create('user_daily_activities', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->date('activity_date');
                $table->integer('study_seconds')->default(0);
                $table->integer('lessons_completed')->default(0);
                $table->integer('quizzes_completed')->default(0);
                $table->integer('challenges_completed')->default(0);
                $table->timestamps();

                $table->unique(['user_id', 'activity_date'], 'user_daily_activity_unique');
                $table->index(['user_id', 'activity_date']);
            });
        }

        // 3. Tablas para Clanes / Grupos de Estudio reales
        if (!Schema::hasTable('clans')) {
            Schema::create('clans', function (Blueprint $table) {
                $table->string('id')->primary(); // e.g. 'krnl', 'algo', 'arch', 'sec', 'ai'
                $table->string('name');
                $table->string('tag', 20);
                $table->string('category', 50)->default('systems');
                $table->text('description');
                $table->json('lines_of_research')->nullable();
                $table->integer('streak_days')->default(1);
                $table->json('weekly_challenge')->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('clan_members')) {
            Schema::create('clan_members', function (Blueprint $table) {
                $table->id();
                $table->string('clan_id');
                $table->foreign('clan_id')->references('id')->on('clans')->onDelete('cascade');
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('role')->default('Cadete Investigador');
                $table->timestamp('joined_at')->useCurrent();

                $table->unique(['clan_id', 'user_id']);
                $table->index('clan_id');
            });
        }

        if (!Schema::hasTable('clan_posts')) {
            Schema::create('clan_posts', function (Blueprint $table) {
                $table->id();
                $table->string('clan_id');
                $table->foreign('clan_id')->references('id')->on('clans')->onDelete('cascade');
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('title');
                $table->text('content');
                $table->string('type', 30)->default('discusion'); // discusion, hallazgo, reto, benchmark
                $table->text('code_snippet')->nullable();
                $table->string('code_language', 30)->nullable();
                $table->integer('upvotes_count')->default(0);
                $table->timestamps();

                $table->index(['clan_id', 'created_at']);
            });
        }

        if (!Schema::hasTable('clan_post_upvotes')) {
            Schema::create('clan_post_upvotes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('post_id')->constrained('clan_posts')->onDelete('cascade');
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->timestamps();

                $table->unique(['post_id', 'user_id']);
            });
        }

        if (!Schema::hasTable('clan_post_comments')) {
            Schema::create('clan_post_comments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('post_id')->constrained('clan_posts')->onDelete('cascade');
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->text('comment');
                $table->timestamps();

                $table->index('post_id');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('clan_post_comments');
        Schema::dropIfExists('clan_post_upvotes');
        Schema::dropIfExists('clan_posts');
        Schema::dropIfExists('clan_members');
        Schema::dropIfExists('clans');
        Schema::dropIfExists('user_daily_activities');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'current_streak',
                'max_streak',
                'last_activity_date',
                'today_study_seconds',
                'total_study_seconds',
                'xp',
                'specialization',
            ]);
        });
    }
};
