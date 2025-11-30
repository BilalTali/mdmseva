<?php

namespace App\Observers;

use App\Models\MonthlyAmountConfiguration;
use App\Models\AmountReport;
use App\Services\ReportStaleService;
use Illuminate\Support\Facades\Log;

class MonthlyAmountConfigurationObserver
{
    protected $staleService;

    public function __construct(ReportStaleService $staleService)
    {
        $this->staleService = $staleService;
    }

    /**
     * Handle the MonthlyAmountConfiguration "saving" event.
     *
     * @param  \App\Models\MonthlyAmountConfiguration  $config
     * @return void
     */
    public function saving(MonthlyAmountConfiguration $config)
    {
        // Calculate totals before saving
        $config->calculateTotals();
    }

    /**
     * Handle the MonthlyAmountConfiguration "saved" event.
     *
     * @param  \App\Models\MonthlyAmountConfiguration  $config
     * @return void
     */
    public function saved(MonthlyAmountConfiguration $config)
    {
        $this->checkAndMarkStale($config);
    }

    /**
     * Check if changes require marking reports as stale.
     *
     * @param MonthlyAmountConfiguration $config
     * @return void
     */
    protected function checkAndMarkStale(MonthlyAmountConfiguration $config)
    {
        // If it's a new record or relevant fields changed
        if ($config->wasRecentlyCreated || $config->isDirty([
            'daily_pulses_primary', 'daily_vegetables_primary', 'daily_oil_primary', 'daily_salt_primary', 'daily_fuel_primary',
            'daily_pulses_middle', 'daily_vegetables_middle', 'daily_oil_middle', 'daily_salt_middle', 'daily_fuel_middle',
            'salt_percentage_common', 'salt_percentage_chilli', 'salt_percentage_turmeric', 'salt_percentage_coriander', 'salt_percentage_other'
        ])) {
            
            Log::info("Monthly Amount Configuration changed for {$config->month}/{$config->year}. Marking reports stale.");

            // 1. Mark the specific month's report as stale
            $report = AmountReport::where('user_id', $config->user_id)
                ->where('month', $config->month)
                ->where('year', $config->year)
                ->first();

            if ($report) {
                $this->staleService->markAmountReportStale($report, "Amount Configuration updated (Rates changed).");
            }

            // 2. Cascade to future reports
            $this->staleService->markFutureReportsStale(
                $config->user, 
                $config->month, 
                $config->year, 
                "Past Amount Configuration updated (Rates changed for {$config->month}/{$config->year})."
            );
        }
    }
}
