<?php

namespace App\Observers;

use App\Models\MonthlyRiceConfiguration;

class MonthlyRiceConfigurationObserver
{
    /**
     * Handle the MonthlyRiceConfiguration "created" event.
     */
    public function created(MonthlyRiceConfiguration $monthlyRiceConfiguration): void
    {
        //
    }

    /**
     * Handle the MonthlyRiceConfiguration "updated" event.
     */
    public function updated(MonthlyRiceConfiguration $config): void
    {
        // Only trigger if relevant fields changed
        if ($config->isDirty([
            'opening_balance_primary', 
            'opening_balance_upper_primary',
            'rice_lifted_primary',
            'rice_lifted_upper_primary',
            'rice_arranged_primary',
            'rice_arranged_upper_primary'
        ])) {
            \Illuminate\Support\Facades\Log::info("Monthly Rice Config updated for {$config->month}/{$config->year}. Triggering auto-regeneration.");
            
            \App\Jobs\RegenerateStaleReportJob::dispatch(
                $config->user_id, 
                $config->month, 
                $config->year
            );
        }
    }
}
