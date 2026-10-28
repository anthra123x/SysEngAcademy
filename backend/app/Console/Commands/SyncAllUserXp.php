<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\XpService;
use Illuminate\Console\Command;

class SyncAllUserXp extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:sync-all-user-xp';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalculate and synchronize XP for all student accounts';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting student XP synchronization...');

        $count = 0;
        User::where('role', 'student')->chunk(100, function ($students) use (&$count) {
            foreach ($students as $student) {
                XpService::syncUserXp($student);
                $count++;
            }
            $this->output->write('.');
        });

        $this->newLine();
        $this->info("Successfully synchronized XP for {$count} students.");

        return Command::SUCCESS;
    }
}
