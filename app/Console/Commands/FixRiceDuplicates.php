<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\MonthlyRiceConfiguration;
use Illuminate\Support\Facades\DB;

class FixRiceDuplicates extends Command
{
    protected $signature = 'rice:fix-duplicates';
    protected $description = 'Find and merge/delete duplicate rice configurations';

    public function handle()
    {
        $this->info('Checking for duplicate rice configurations...');

        $duplicates = MonthlyRiceConfiguration::select('user_id', 'month', 'year', DB::raw('count(*) as total'))
            ->groupBy('user_id', 'month', 'year')
            ->having('total', '>', 1)
            ->get();

        if ($duplicates->isEmpty()) {
            $this->info('No duplicates found.');
            return 0;
        }

        $this->info("Found {$duplicates->count()} sets of duplicates.");

        foreach ($duplicates as $dup) {
            $this->line("\nProcessing User {$dup->user_id} - {$dup->month}/{$dup->year} ({$dup->total} entries)");

            $entries = MonthlyRiceConfiguration::where('user_id', $dup->user_id)
                ->where('month', $dup->month)
                ->where('year', $dup->year)
                ->orderBy('updated_at', 'desc') // Keep the most recently updated one
                ->get();

            // The first one is the "keeper" (most recently updated)
            $keeper = $entries->first();
            $this->info("Keeping ID: {$keeper->id} (Updated: {$keeper->updated_at}, Opening P: {$keeper->opening_balance_primary})");

            // Delete the rest
            foreach ($entries->slice(1) as $entry) {
                $this->warn("Deleting ID: {$entry->id} (Updated: {$entry->updated_at}, Opening P: {$entry->opening_balance_primary})");
                $entry->delete();
            }
        }

        $this->info("\nDuplicate cleanup complete!");
        return 0;
    }
}
