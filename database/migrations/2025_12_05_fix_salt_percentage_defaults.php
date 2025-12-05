<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Migration to update default salt percentage values in existing records
 * to match the corrected application defaults.
 * 
 * OLD DEFAULTS (incorrect): 30%, 20%, 20%, 15%, 15%
 * NEW DEFAULTS (correct):   5%, 35%, 25%, 15%, 20%
 * 
 * This migration updates ONLY records that still have the old default values.
 * Custom user values are preserved.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update records that have the OLD default values to the NEW defaults
        DB::table('monthly_amount_configurations')
            ->where('salt_percentage_common', 30)
            ->where('salt_percentage_chilli', 20)
            ->where('salt_percentage_turmeric', 20)
            ->where('salt_percentage_coriander', 15)
            ->where('salt_percentage_other', 15)
            ->update([
                'salt_percentage_common' => 5,
                'salt_percentage_chilli' => 35,
                'salt_percentage_turmeric' => 25,
                'salt_percentage_coriander' => 15, // unchanged
                'salt_percentage_other' => 20,
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to old defaults
        DB::table('monthly_amount_configurations')
            ->where('salt_percentage_common', 5)
            ->where('salt_percentage_chilli', 35)
            ->where('salt_percentage_turmeric', 25)
            ->where('salt_percentage_coriander', 15)
            ->where('salt_percentage_other', 20)
            ->update([
                'salt_percentage_common' => 30,
                'salt_percentage_chilli' => 20,
                'salt_percentage_turmeric' => 20,
                'salt_percentage_coriander' => 15,
                'salt_percentage_other' => 15,
            ]);
    }
};
