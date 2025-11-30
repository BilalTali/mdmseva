<?php

namespace App\Console\Commands;

use App\Models\MonthlyRiceConfiguration;
use Illuminate\Console\Command;

class SyncRiceConfigurations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rice:sync 
                            {--month= : Specific month to sync (1-12)}
                            {--year= : Specific year to sync}
                            {--all : Sync all rice configurations}';

    /**
     * The console description of the console command.
     *
     * @var string
     */
    protected $description = 'Sync consumed amounts from daily consumption to rice configurations';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting rice configuration sync...');

        if ($this->option('all')) {
            $this->syncAll();
        } elseif ($this->option('month') && $this->option('year')) {
            $this->syncSpecific((int)$this->option('month'), (int)$this->option('year'));
        } else {
            $this->error('Please specify either --all or both --month and --year');
            return 1;
        }

        $this->info('Sync completed successfully!');
        return 0;
    }

    private function syncAll()
    {
        $configs = MonthlyRiceConfiguration::all();
        
        $this->info("Found {$configs->count()} configurations to sync");
        
        $bar = $this->output->createProgressBar($configs->count());
        $bar->start();

        foreach ($configs as $config) {
            $config->syncConsumedFromDaily();
            $config->save();
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
    }

    private function syncSpecific(int $month, int $year)
    {
        $configs = MonthlyRiceConfiguration::where('month', $month)
            ->where('year', $year)
            ->get();

        if ($configs->isEmpty()) {
            $this->warn("No configurations found for {$month}/{$year}");
            return;
        }

        $this->info("Syncing {$configs->count()} configuration(s) for {$month}/{$year}");

        foreach ($configs as $config) {
            $this->line("  User ID: {$config->user_id}");
            $this->line("  Before: Consumed = {$config->consumed_primary} + {$config->consumed_upper_primary} = " . 
                       ($config->consumed_primary + $config->consumed_upper_primary) . " kg");
            
            $config->syncConsumedFromDaily();
            $config->save();
            
            $this->line("  After:  Consumed = {$config->consumed_primary} + {$config->consumed_upper_primary} = " . 
                       ($config->consumed_primary + $config->consumed_upper_primary) . " kg");
            $this->line("  Closing = {$config->closing_balance_primary} + {$config->closing_balance_upper_primary} = " . 
                       ($config->closing_balance_primary + $config->closing_balance_upper_primary) . " kg");
        }
    }
}
