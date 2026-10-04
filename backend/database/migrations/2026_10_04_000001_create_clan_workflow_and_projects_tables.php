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
        // 1. Ampliar tabla clans con gamificación y drills
        Schema::table('clans', function (Blueprint $table) {
            if (!Schema::hasColumn('clans', 'level')) {
                $table->integer('level')->default(3);
            }
            if (!Schema::hasColumn('clans', 'level_title')) {
                $table->string('level_title')->default('Laboratorio I+D de Sistemas');
            }
            if (!Schema::hasColumn('clans', 'current_xp')) {
                $table->integer('current_xp')->default(3450);
            }
            if (!Schema::hasColumn('clans', 'next_level_xp')) {
                $table->integer('next_level_xp')->default(5000);
            }
            if (!Schema::hasColumn('clans', 'weekly_quest')) {
                $table->json('weekly_quest')->nullable();
            }
        });

        // 2. Avales y sellos docentes en publicaciones RFC/ADR
        Schema::table('clan_posts', function (Blueprint $table) {
            if (!Schema::hasColumn('clan_posts', 'teacher_endorsement')) {
                $table->json('teacher_endorsement')->nullable();
            }
            if (!Schema::hasColumn('clan_posts', 'author_role')) {
                $table->string('author_role', 100)->default('Miembro del Clan');
            }
        });

        // 3. Proyectos del Clan
        if (!Schema::hasTable('clan_projects')) {
            Schema::create('clan_projects', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->string('clan_id');
                $table->foreign('clan_id')->references('id')->on('clans')->onDelete('cascade');
                $table->string('title');
                $table->text('description');
                $table->string('lead_researcher')->default('Director Cátedra Sistemas');
                $table->string('status', 30)->default('en_progreso');
                $table->json('tech_stack')->nullable();
                $table->json('members_joined')->nullable();
                $table->string('active_branch', 100)->default('main');
                $table->json('production_deployment')->nullable();
                $table->timestamps();

                $table->index('clan_id');
            });
        }

        // 4. Tareas del Sprint (Tablero Kanban)
        if (!Schema::hasTable('clan_project_tasks')) {
            Schema::create('clan_project_tasks', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->string('project_id');
                $table->foreign('project_id')->references('id')->on('clan_projects')->onDelete('cascade');
                $table->string('clan_id');
                $table->foreign('clan_id')->references('id')->on('clans')->onDelete('cascade');
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('status', 30)->default('pending'); // pending, in_progress, review, completed
                $table->string('type', 30)->default('feature'); // feature, bug, perf, security, arch
                $table->string('assigned_to')->nullable();
                $table->integer('xp_reward')->default(45);
                $table->boolean('completed')->default(false);
                $table->timestamps();

                $table->index(['project_id', 'status']);
                $table->index('clan_id');
            });
        }

        // 5. Pull Requests con Vercel Previews
        if (!Schema::hasTable('clan_project_pull_requests')) {
            Schema::create('clan_project_pull_requests', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->string('project_id');
                $table->foreign('project_id')->references('id')->on('clan_projects')->onDelete('cascade');
                $table->string('clan_id');
                $table->foreign('clan_id')->references('id')->on('clans')->onDelete('cascade');
                $table->integer('number');
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('source_branch', 100);
                $table->string('target_branch', 100)->default('main');
                $table->string('status', 20)->default('open'); // open, merged, closed
                $table->string('ci_status', 20)->default('passed'); // pending, passed, failed
                $table->string('author');
                $table->string('author_role')->default('Cadete Investigador');
                $table->string('preview_url')->nullable();
                $table->string('build_duration', 30)->default('24s');
                $table->json('code_diff')->nullable();
                $table->json('reviews')->nullable();
                $table->integer('xp_reward')->default(90);
                $table->string('linked_issue_id')->nullable();
                $table->string('merged_at')->nullable();
                $table->string('merged_by')->nullable();
                $table->timestamps();

                $table->index(['project_id', 'status']);
                $table->index('clan_id');
            });
        }

        // 6. Commits del Proyecto
        if (!Schema::hasTable('clan_project_commits')) {
            Schema::create('clan_project_commits', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->string('project_id');
                $table->foreign('project_id')->references('id')->on('clan_projects')->onDelete('cascade');
                $table->string('clan_id');
                $table->foreign('clan_id')->references('id')->on('clans')->onDelete('cascade');
                $table->string('hash', 40);
                $table->string('message');
                $table->string('author');
                $table->string('branch', 100)->default('main');
                $table->string('time_ago', 50)->nullable();
                $table->timestamps();

                $table->index('project_id');
                $table->index('clan_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clan_project_commits');
        Schema::dropIfExists('clan_project_pull_requests');
        Schema::dropIfExists('clan_project_tasks');
        Schema::dropIfExists('clan_projects');

        Schema::table('clan_posts', function (Blueprint $table) {
            $table->dropColumn(['teacher_endorsement', 'author_role']);
        });

        Schema::table('clans', function (Blueprint $table) {
            $table->dropColumn(['level', 'level_title', 'current_xp', 'next_level_xp', 'weekly_quest']);
        });
    }
};
