<?php

use App\Models\Enrollment;
use App\Models\LessonProgress;
use App\Models\StudentFeedback;
use App\Models\User;
use App\Services\XpService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Identificar cuentas residuales generadas por pruebas automatizadas
        $phantomUsers = User::where(function ($q) {
            $q->where('email', 'like', '%example.com%')
              ->orWhere('email', 'like', '%@sysengacademy.dev%')
              ->orWhere('email', 'like', '%sysengacademy.site%')
              ->orWhere('email', 'like', 'test_%')
              ->orWhere('email', 'like', 'reset_test_%')
              ->orWhere('email', 'like', 'fallback_test_%')
              ->orWhere('email', 'like', 'change_test_%')
              ->orWhere('email', 'like', 'change_ok_%')
              ->orWhere('email', 'like', 'login_test_%')
              ->orWhere('email', 'like', 'usuario_6ac%')
              ->orWhere('email', 'like', 'estudiante_6ac%')
              ->orWhere('email', 'like', 'teacher_test_%')
              ->orWhere('name', 'like', 'Test %')
              ->orWhere('name', 'like', 'Fallback %');
        })->get();

        if ($phantomUsers->isNotEmpty()) {
            $phantomIds = $phantomUsers->pluck('id')->all();

            // Limpiar registros relacionados para preservar integridad referencial
            LessonProgress::whereIn('user_id', $phantomIds)->delete();
            Enrollment::whereIn('user_id', $phantomIds)->delete();
            StudentFeedback::whereIn('student_id', $phantomIds)
                ->orWhereIn('teacher_id', $phantomIds)
                ->delete();

            if (Schema::hasTable('personal_access_tokens')) {
                DB::table('personal_access_tokens')
                    ->whereIn('tokenable_id', $phantomIds)
                    ->delete();
            }

            if (Schema::hasTable('ai_conversations')) {
                DB::table('ai_conversations')
                    ->whereIn('user_id', $phantomIds)
                    ->delete();
            }

            if (Schema::hasTable('forum_posts')) {
                DB::table('forum_posts')
                    ->whereIn('user_id', $phantomIds)
                    ->delete();
            }

            if (Schema::hasTable('forum_comments')) {
                DB::table('forum_comments')
                    ->whereIn('user_id', $phantomIds)
                    ->delete();
            }

            // Eliminar usuarios fantasma
            User::whereIn('id', $phantomIds)->delete();
        }

        // 2. Sincronizar y consolidar XP real para todos los estudiantes legítimos
        $realStudents = User::where('role', 'student')->get();
        foreach ($realStudents as $student) {
            XpService::syncUserXp($student);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No es necesario restaurar cuentas de prueba eliminadas
    }
};
