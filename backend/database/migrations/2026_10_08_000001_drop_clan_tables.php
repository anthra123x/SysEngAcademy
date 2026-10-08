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
        Schema::dropIfExists('clan_project_commits');
        Schema::dropIfExists('clan_project_pull_requests');
        Schema::dropIfExists('clan_project_tasks');
        Schema::dropIfExists('clan_projects');
        Schema::dropIfExists('clan_post_upvotes');
        Schema::dropIfExists('clan_post_comments');
        Schema::dropIfExists('clan_posts');
        Schema::dropIfExists('clan_members');
        Schema::dropIfExists('clans');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // El módulo ha sido retirado permanentemente
    }
};
