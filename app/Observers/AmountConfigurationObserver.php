<?php

namespace App\Observers;

use App\Models\AmountConfiguration;
use App\Models\DailyConsumption;
use App\Models\MonthlyRiceConfiguration;

class AmountConfigurationObserver
{
    /**
     * Handle the AmountConfiguration "updated" event.
     */
    public function updated(AmountConfiguration $amountConfiguration): void
    {
        // Recalculate all daily consumptions for this user
        $this->recalculateConsumptions($amountConfiguration->user_id);
    }

    /**
     * Recalculate all consumption records for a user.
     */
    protected function recalculateConsumptions(int $userId): void
    {
        $consumptions = DailyConsumption::where('user_id', $userId)
            ->orderBy('date', 'asc')
            ->get();
            
        $amountConfig = AmountConfiguration::where('user_id', $userId)->latest()->first();
        
        if (!$amountConfig) {
            return;
        }

        // Get initial rice balance from MonthlyRiceConfiguration
        $riceConfig = MonthlyRiceConfiguration::where('user_id', $userId)->latest()->first();
        $runningBalance = $riceConfig 
            ? ($riceConfig->closing_balance_primary + $riceConfig->closing_balance_upper_primary)
            : 0;

        foreach ($consumptions as $consumption) {
            // Recalculate rice (using config)
            $ricePrimary = config('mdm.rice_per_student.primary');
            $riceMiddle = config('mdm.rice_per_student.middle');
            
            $riceConsumedPrimary = ($consumption->served_primary ?? 0) * $ricePrimary;
            $riceConsumedMiddle = ($consumption->served_middle ?? 0) * $riceMiddle;
            $totalRiceConsumed = $riceConsumedPrimary + $riceConsumedMiddle;
            
            // Recalculate amount
            $amountPrimary = ($consumption->served_primary ?? 0) * (
                $amountConfig->daily_pulses_primary +
                $amountConfig->daily_vegetables_primary +
                $amountConfig->daily_oil_primary +
                $amountConfig->daily_salt_primary +
                $amountConfig->daily_fuel_primary
            );

            $amountMiddle = ($consumption->served_middle ?? 0) * (
                $amountConfig->daily_pulses_middle +
                $amountConfig->daily_vegetables_middle +
                $amountConfig->daily_oil_middle +
                $amountConfig->daily_salt_middle +
                $amountConfig->daily_fuel_middle
            );

            // Update running balance
            $runningBalance -= $totalRiceConsumed;
            
            // Update without triggering events
            $consumption->updateQuietly([
                'rice_consumed' => $totalRiceConsumed,
                'rice_balance_after' => $runningBalance,
                'amount_consumed' => $amountPrimary + $amountMiddle,
            ]);
        }
    }
}
