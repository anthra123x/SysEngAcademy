<?php

namespace App\Console\Commands;

use App\Models\Enrollment;
use App\Models\LessonProgress;
use App\Models\StudentFeedback;
use App\Models\User;
use App\Services\XpService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CleanPhantomTestUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:clean-phantom-users {--dry-run : Only list matches without deleting} {--force : Force execution without interactive confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Safely identify and remove residual test/mock user accounts generated during tests';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $isDryRun = $this->option('dry-run');
        $force = $this->option('force');

        $this->info('Searching for test accounts...');

        // Excluir dominios de producción legítimos como sysengacademy.site
        $phantomQuery = User::where(function ($q) {
            $q->where('email', 'like', '%@example.com')
              ->orWhere('email', 'like', '%@example.org')
              ->orWhere('email', 'like', '%@sysengacademy.dev')
              ->orWhere('email', 'like', 'test_%@%')
              ->orWhere('email', 'like', 'reset_test_%@%')
              ->orWhere('email', 'like', 'fallback_test_%@%')
              ->orWhere('email', 'like', 'change_test_%@%')
              ->orWhere('email', 'like', 'change_ok_%@%')
              ->orWhere('email', 'like', 'login_test_%@%')
              ->orWhere('email', 'like', 'usuario_6ac%@%')
              ->orWhere('email', 'like', 'estudiante_6ac%@%')
              ->orWhere('email', 'like', 'teacher_test_%@%')
              ->orWhere('name', 'like', 'Test User%')
              ->orWhere('name', 'like', 'Fallback Test%');
        });

        $phantomUsers = $phantomQuery->get(['id', 'name', 'email', 'role']);

        if ($phantomUsers->isEmpty()) {
            $this->info('No test accounts found.');
            return Command::SUCCESS;
        }

        $this->table(['ID', 'Name', 'Email', 'Role'], $phantomUsers->toArray());

        if ($isDryRun) {
            $this->warn("Dry-run mode: {$phantomUsers->count()} test users found. No changes were made.");
            return Command::SUCCESS;
        }

        if (!$force && !$this->confirm("Are you sure you want to permanently delete these {$phantomUsers->count()} accounts?")) {
            $this->info('Operation cancelled.');
            return Command::SUCCESS;
        }

        $phantomIds = $phantomUsers->pluck('id')->all();

        DB::transaction(function () use ($phantomIds) {
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

            User::whereIn('id', $phantomIds)->delete();
        });

        $this->info("Successfully deleted {$phantomUsers->count()} test accounts.");
        return Command::SUCCESS;
    }
}
