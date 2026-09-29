<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Índices de alto rendimiento para gestión multi-cuenta y concurrencia
        DB::statement('CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at DESC);');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses (instructor_id);');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses (is_published);');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON enrollments (user_id, course_id);');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_enrollments_completed_at ON enrollments (completed_at);');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON lesson_progress (user_id, lesson_id);');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_lesson_progress_completed_at ON lesson_progress (completed_at DESC);');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS idx_users_role;');
        DB::statement('DROP INDEX IF EXISTS idx_users_created_at;');
        DB::statement('DROP INDEX IF EXISTS idx_courses_instructor_id;');
        DB::statement('DROP INDEX IF EXISTS idx_courses_is_published;');
        DB::statement('DROP INDEX IF EXISTS idx_enrollments_user_course;');
        DB::statement('DROP INDEX IF EXISTS idx_enrollments_completed_at;');
        DB::statement('DROP INDEX IF EXISTS idx_lesson_progress_user_lesson;');
        DB::statement('DROP INDEX IF EXISTS idx_lesson_progress_completed_at;');
    }
};
