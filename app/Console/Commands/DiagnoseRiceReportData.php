<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\MonthlyRiceConfiguration;
use App\Services\ConsumptionCalculationService;
use Illuminate\Support\Facades\Auth;

class DiagnoseRiceReportData extends Command
{
    protected $signature = 'diagnose:rice-data {user_id}';
    protected $description = 'Diagnose rice report data issues';

    public function handle(ConsumptionCalculationService $calculationService)
    {
        $userId = $this->argument('user_id');
        
        $this->info("Diagnosing rice data for user {$userId}...");
        
        // Get all configs
        $configs = MonthlyRiceConfiguration::where('user_id', $userId)
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get();
        
        $this->info("\nAll Rice Configurations:");
        foreach ($configs as $config) {
            $monthName = date('F', mktime(0, 0, 0, $config->month, 1));
            $this->line("{$monthName} {$config->year}: Primary={$config->consumed_primary}, Middle={$config->consumed_upper_primary}, Total=" . ($config->consumed_primary + $config->consumed_upper_primary));
        }
        
        // Get latest
        $latest = $configs->first();
        if ($latest) {
            $this->info("\nLatest Config: " . date('F',mktime(0, 0, 0, $latest->month, 1)) . " {$latest->year}");
            
            // Get summary for latest month
            $user = \App\Models\User::find($userId);
            $summary = $calculationService->getMonthSummary($user, $latest->month, $latest->year);
            
            $this->info("\ngetMonthSummary() for latest month:");
            $this->line("Total Rice Consumed: {$summary['totalRiceConsumed']} kg");
            $this->line("Opening Balance: {$summary['openingBalance']} kg");
            $this->line("Current Balance: {$summary['currentBalance']} kg");
            $this->line("Avg Daily: {$summary['avgDailyConsumption']} kg");
        }
        
        return 0;
    }
}
