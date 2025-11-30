<?php

namespace App\Observers;

use App\Models\DailyConsumption;
use App\Models\MonthlyRiceConfiguration;
use App\Models\User;
use App\Services\ConsumptionCalculationService;
use App\Services\ReportStaleService;
use Illuminate\Support\Facades\Log;

class DailyConsumptionObserver
{
    protected $staleService;
    protected $calculationService;

    public function __construct(
        ReportStaleService $staleService,
        ConsumptionCalculationService $calculationService
    ) {
        $this->staleService = $staleService;
        $this->calculationService = $calculationService;
    }

    /**
     * Handle the DailyConsumption "saved" event.
     */
    public function saved(DailyConsumption $consumption): void
    {
        $this->checkAndRegenerate($consumption, 'updated');
        $this->syncRiceConfiguration($consumption);
    }

    /**
     * Handle the DailyConsumption "deleted" event.
     */
    public function deleted(DailyConsumption $consumption): void
    {
        $this->checkAndRegenerate($consumption, 'deleted');
        $this->syncRiceConfiguration($consumption);
    }

    /**
     * Sync the MonthlyRiceConfiguration with the latest daily consumption totals.
     */
    protected function syncRiceConfiguration(DailyConsumption $consumption): void
    {
        $date = $consumption->date;
        $month = $date->month;
        $year = $date->year;
        $userId = $consumption->user_id;

        $config = MonthlyRiceConfiguration::where('user_id', $userId)
            ->where('month', $month)
            ->where('year', $year)
            ->first();

        if (!$config) {
            return;
        }

        $user = $consumption->user ?? User::find($userId);
        $summary = $this->calculationService->getMonthSummary($user, $month, $year);

        $config->consumed_primary = $summary['totalRicePrimary'] ?? 0;
        $config->consumed_upper_primary = $summary['totalRiceMiddle'] ?? 0;

        $config->closing_balance_primary = round(
            ($config->opening_balance_primary ?? 0) +
            ($config->rice_lifted_primary ?? 0) +
            ($config->rice_arranged_primary ?? 0) -
            $config->consumed_primary,
            2
        );

        $config->closing_balance_upper_primary = round(
            ($config->opening_balance_upper_primary ?? 0) +
            ($config->rice_lifted_upper_primary ?? 0) +
            ($config->rice_arranged_upper_primary ?? 0) -
            $config->consumed_upper_primary,
            2
        );

        $config->save();

        Log::info("Synced MonthlyRiceConfiguration for {$month}/{$year} after DailyConsumption change.");
    }

    /**
     * Check if changes require regenerating reports.
     */
    protected function checkAndRegenerate(DailyConsumption $consumption, string $action): void
    {
        $date = $consumption->date;
        $month = $date->month;
        $year = $date->year;
        $userId = $consumption->user_id;

        Log::info("Daily Consumption {$action} for {$date->format('Y-m-d')}. Triggering auto-regeneration.");

        \App\Jobs\RegenerateStaleReportJob::dispatch($userId, $month, $year);
    }
}
