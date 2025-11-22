<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Updates existing amount_configurations records where daily_salt values are 0
     * to set them to reasonable defaults based on other daily costs.
     */
    public function up(): void
    {
        // Get all configurations where salt is 0
        $configs = DB::table('amount_configurations')
            ->where(function ($query) {
                $query->where('daily_salt_primary', 0)
                      ->orWhere('daily_salt_middle', 0);
            })
            ->get();

        foreach ($configs as $config) {
            $updates = [];

            // If primary salt is 0, set it to a reasonable default
            if ($config->daily_salt_primary == 0) {
                // Calculate as ~8% of total daily cost (reasonable salt proportion)
                $totalPrimary = 
                    ($config->daily_pulses_primary ?? 0) +
                    ($config->daily_vegetables_primary ?? 0) +
                    ($config->daily_oil_primary ?? 0) +
                    ($config->daily_fuel_primary ?? 0);
                
                $suggestedSalt = round($totalPrimary * 0.08, 2);
                $updates['daily_salt_primary'] = max($suggestedSalt, 0.75); // Minimum ₹0.75
            }

            // If middle salt is 0, set it to a reasonable default
            if ($config->daily_salt_middle == 0) {
                // Calculate as ~8% of total daily cost (reasonable salt proportion)
                $totalMiddle = 
                    ($config->daily_pulses_middle ?? 0) +
                    ($config->daily_vegetables_middle ?? 0) +
                    ($config->daily_oil_middle ?? 0) +
                    ($config->daily_fuel_middle ?? 0);
                
                $suggestedSalt = round($totalMiddle * 0.08, 2);
                $updates['daily_salt_middle'] = max($suggestedSalt, 1.00); // Minimum ₹1.00
            }

            // Apply updates if any
            if (!empty($updates)) {
                DB::table('amount_configurations')
                    ->where('id', $config->id)
                    ->update($updates);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Cannot reverse this - we don't know what the original values were
        // This is a data fix migration, not a schema change
    }
};
