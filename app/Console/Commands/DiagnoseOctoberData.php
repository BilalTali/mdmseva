<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\MonthlyRiceConfiguration;

class DiagnoseOctoberData extends Command
{
    protected $signature = 'diagnose:october';
    protected $description = 'Diagnose October 2025 rice data issues';

    public function handle()
    {
        $this->info('Diagnosing Rice Data...');

        // Check September 2025 (Previous Month)
        $sept = MonthlyRiceConfiguration::where('month', 9)->where('year', 2025)->first();
        if ($sept) {
            $this->info("\n--- September 2025 ---");
            $this->line("Primary: Opening={$sept->opening_balance_primary}, Lifted={$sept->rice_lifted_primary}, Consumed={$sept->consumed_primary}, Closing={$sept->closing_balance_primary}");
            $this->line("Middle:  Opening={$sept->opening_balance_upper_primary}, Lifted={$sept->rice_lifted_upper_primary}, Consumed={$sept->consumed_upper_primary}, Closing={$sept->closing_balance_upper_primary}");
        } else {
            $this->error("\nSeptember 2025 config not found!");
        }

        // Check October 2025 (Current Problem Month)
        $oct = MonthlyRiceConfiguration::where('month', 10)->where('year', 2025)->first();
        if ($oct) {
            $this->info("\n--- October 2025 ---");
            $this->line("Primary: Opening={$oct->opening_balance_primary}, Lifted={$oct->rice_lifted_primary}, Consumed={$oct->consumed_primary}, Closing={$oct->closing_balance_primary}");
            $this->line("Middle:  Opening={$oct->opening_balance_upper_primary}, Lifted={$oct->rice_lifted_upper_primary}, Consumed={$oct->consumed_upper_primary}, Closing={$oct->closing_balance_upper_primary}");
            
            // Calculate what it SHOULD be
            $expectedOpeningP = $sept ? $sept->closing_balance_primary : 0;
            $expectedOpeningM = $sept ? $sept->closing_balance_upper_primary : 0;
            
            $this->info("\n--- Analysis ---");
            if (abs($oct->opening_balance_primary - $expectedOpeningP) > 0.01) {
                $this->error("Primary Opening Mismatch! Expected {$expectedOpeningP}, got {$oct->opening_balance_primary}");
            }
            if (abs($oct->opening_balance_upper_primary - $expectedOpeningM) > 0.01) {
                $this->error("Middle Opening Mismatch! Expected {$expectedOpeningM}, got {$oct->opening_balance_upper_primary}");
            }
            
            $calcClosingP = ($oct->opening_balance_primary + $oct->rice_lifted_primary + $oct->rice_arranged_primary) - $oct->consumed_primary;
            $this->line("Calculated Primary Closing: {$calcClosingP} (DB says {$oct->closing_balance_primary})");
            
            $calcClosingM = ($oct->opening_balance_upper_primary + $oct->rice_lifted_upper_primary + $oct->rice_arranged_upper_primary) - $oct->consumed_upper_primary;
            $this->line("Calculated Middle Closing: {$calcClosingM} (DB says {$oct->closing_balance_upper_primary})");
            
        } else {
            $this->error("\nOctober 2025 config not found!");
        }
    }
}
