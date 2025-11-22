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
     * Adds the missing daily_salt_iodized and daily_salt_non_iodized fields that
     * ConsumptionCalculationService expects for calculating salt amounts.
     */
    public function up(): void
    {
        Schema::table('amount_configurations', function (Blueprint $table) {
            // Add iodized/non-iodized salt fields for primary
            $table->decimal('daily_salt_iodized_primary', 10, 2)
                ->default(0)
                ->after('daily_oil_primary')
                ->comment('Daily iodized salt rate per student for primary');
            
            $table->decimal('daily_salt_non_iodized_primary', 10, 2)
                ->default(0)
                ->after('daily_salt_iodized_primary')
                ->comment('Daily non-iodized salt rate per student for primary');
            
            // Add iodized/non-iodized salt fields for middle
            $table->decimal('daily_salt_iodized_middle', 10, 2)
                ->default(0)
                ->after('daily_oil_middle')
                ->comment('Daily iodized salt rate per student for middle');
            
            $table->decimal('daily_salt_non_iodized_middle', 10, 2)
                ->default(0)
                ->after('daily_salt_iodized_middle')
                ->comment('Daily non-iodized salt rate per student for middle');
        });

        // Set values based on existing daily_salt fields (split 50/50)
        DB::statement('
            UPDATE amount_configurations 
            SET 
                daily_salt_iodized_primary = daily_salt_primary * 0.5,
                daily_salt_non_iodized_primary = daily_salt_primary * 0.5,
                daily_salt_iodized_middle = daily_salt_middle * 0.5,
                daily_salt_non_iodized_middle = daily_salt_middle * 0.5
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('amount_configurations', function (Blueprint $table) {
            $table->dropColumn([
                'daily_salt_iodized_primary',
                'daily_salt_non_iodized_primary',
                'daily_salt_iodized_middle',
                'daily_salt_non_iodized_middle',
            ]);
        });
    }
};
