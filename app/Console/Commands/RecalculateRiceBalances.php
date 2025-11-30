<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\MonthlyRiceConfiguration;
use App\Models\DailyConsumption;

class RecalculateRiceBalances extends Command
{
    protected $signature = 'rice:recalculate-chain';
    protected $description = 'Recalculate rice balance chain from April 2025 onwards';

    public function handle()
    {
        $this->info('Recalculating rice balance chain...');

        // Get all configs ordered by year, month
        // We assume we start from April 2025 (start of academic session)
        // Or just get all and sort them
        $configs = MonthlyRiceConfiguration::orderBy('year')->orderBy('month')->get();

        if ($configs->isEmpty()) {
            $this->error('No configurations found.');
            return 1;
        }

        $prevClosingPrimary = 0;
        $prevClosingMiddle = 0;
        
        // Group by user to handle multiple users if needed
        $configsByUser = $configs->groupBy('user_id');

        foreach ($configsByUser as $userId => $userConfigs) {
            $this->info("\nProcessing User ID: {$userId}");
            
            // Reset for each user
            $prevClosingPrimary = 0;
            $prevClosingMiddle = 0;
            $isFirst = true;

            foreach ($userConfigs as $config) {
                $this->line("Processing {$config->month}/{$config->year}...");

                // 1. Update Opening Balance (except for the very first record, or April)
                // Actually, if it's April, we might want to keep the manual opening balance
                // But if the chain is broken, we might need to trust the previous month
                
                // Logic: If it's NOT the first record, set opening = prev closing
                if (!$isFirst) {
                    $config->opening_balance_primary = $prevClosingPrimary;
                    $config->opening_balance_upper_primary = $prevClosingMiddle;
                } else {
                    // First record: Keep existing opening balance as the "seed"
                    $this->info("  Starting with existing opening balance: P={$config->opening_balance_primary}, M={$config->opening_balance_upper_primary}");
                }

                // 2. Recalculate Consumed (Just to be sure)
                $consumptions = DailyConsumption::where('user_id', $userId)
                    ->whereMonth('date', $config->month)
                    ->whereYear('date', $config->year)
                    ->get();
                
                $primaryRate = ($config->daily_consumption_primary / 1000) ?? 0.1;
                $middleRate = ($config->daily_consumption_upper_primary / 1000) ?? 0.15;
                
                $totalPrimary = 0;
                $totalMiddle = 0;
                
                foreach ($consumptions as $consumption) {
                    $totalPrimary += ($consumption->served_primary ?? 0) * $primaryRate;
                    $totalMiddle += ($consumption->served_middle ?? 0) * $middleRate;
                }
                
                $config->consumed_primary = round($totalPrimary, 2);
                $config->consumed_upper_primary = round($totalMiddle, 2);

                // 3. Calculate Closing
                $openingP = ($config->opening_balance_primary ?? 0) + ($config->rice_lifted_primary ?? 0) + ($config->rice_arranged_primary ?? 0);
                $openingM = ($config->opening_balance_upper_primary ?? 0) + ($config->rice_lifted_upper_primary ?? 0) + ($config->rice_arranged_upper_primary ?? 0);
                
                $closingP = round($openingP - $totalPrimary, 2);
                $closingM = round($openingM - $totalMiddle, 2);
                
                $config->closing_balance_primary = $closingP;
                $config->closing_balance_upper_primary = $closingM;
                
                $config->save();
                
                $this->line("  -> Closed with: P={$closingP}, M={$closingM}");

                // Prepare for next month
                $prevClosingPrimary = $closingP;
                $prevClosingMiddle = $closingM;
                $isFirst = false;
            }
        }

        $this->info("\nRecalculation complete!");
        return 0;
    }
}
