<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('monthly_amount_configurations', function (Blueprint $table) {
            // Primary rates
            $table->decimal('daily_pulses_primary', 8, 2)->nullable()->after('daily_amount_per_student_primary');
            $table->decimal('daily_vegetables_primary', 8, 2)->nullable()->after('daily_pulses_primary');
            $table->decimal('daily_oil_primary', 8, 2)->nullable()->after('daily_vegetables_primary');
            $table->decimal('daily_salt_primary', 8, 2)->nullable()->after('daily_oil_primary');
            $table->decimal('daily_fuel_primary', 8, 2)->nullable()->after('daily_salt_primary');

            // Middle rates
            $table->decimal('daily_pulses_middle', 8, 2)->nullable()->after('daily_amount_per_student_upper_primary');
            $table->decimal('daily_vegetables_middle', 8, 2)->nullable()->after('daily_pulses_middle');
            $table->decimal('daily_oil_middle', 8, 2)->nullable()->after('daily_vegetables_middle');
            $table->decimal('daily_salt_middle', 8, 2)->nullable()->after('daily_oil_middle');
            $table->decimal('daily_fuel_middle', 8, 2)->nullable()->after('daily_salt_middle');

            // Salt percentages (unified)
            $table->decimal('salt_percentage_common', 5, 2)->default(30)->after('is_locked');
            $table->decimal('salt_percentage_chilli', 5, 2)->default(20)->after('salt_percentage_common');
            $table->decimal('salt_percentage_turmeric', 5, 2)->default(20)->after('salt_percentage_chilli');
            $table->decimal('salt_percentage_coriander', 5, 2)->default(15)->after('salt_percentage_turmeric');
            $table->decimal('salt_percentage_other', 5, 2)->default(15)->after('salt_percentage_coriander');
        });

        // Migrate data from amount_configurations
        $this->migrateData();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('monthly_amount_configurations', function (Blueprint $table) {
            $table->dropColumn([
                'daily_pulses_primary',
                'daily_vegetables_primary',
                'daily_oil_primary',
                'daily_salt_primary',
                'daily_fuel_primary',
                'daily_pulses_middle',
                'daily_vegetables_middle',
                'daily_oil_middle',
                'daily_salt_middle',
                'daily_fuel_middle',
                'salt_percentage_common',
                'salt_percentage_chilli',
                'salt_percentage_turmeric',
                'salt_percentage_coriander',
                'salt_percentage_other',
            ]);
        });
    }

    /**
     * Migrate data from amount_configurations to monthly_amount_configurations
     */
    protected function migrateData()
    {
        $configs = DB::table('amount_configurations')->get();

        foreach ($configs as $config) {
            DB::table('monthly_amount_configurations')
                ->where('user_id', $config->user_id)
                ->where('month', $config->month)
                ->where('year', $config->year)
                ->update([
                    'daily_pulses_primary' => $config->daily_pulses_primary,
                    'daily_vegetables_primary' => $config->daily_vegetables_primary,
                    'daily_oil_primary' => $config->daily_oil_primary,
                    'daily_salt_primary' => $config->daily_salt_primary,
                    'daily_fuel_primary' => $config->daily_fuel_primary,
                    
                    'daily_pulses_middle' => $config->daily_pulses_middle,
                    'daily_vegetables_middle' => $config->daily_vegetables_middle,
                    'daily_oil_middle' => $config->daily_oil_middle,
                    'daily_salt_middle' => $config->daily_salt_middle,
                    'daily_fuel_middle' => $config->daily_fuel_middle,

                    'salt_percentage_common' => $config->salt_percentage_common ?? 30,
                    'salt_percentage_chilli' => $config->salt_percentage_chilli ?? 20,
                    'salt_percentage_turmeric' => $config->salt_percentage_turmeric ?? 20,
                    'salt_percentage_coriander' => $config->salt_percentage_coriander ?? 15,
                    'salt_percentage_other' => $config->salt_percentage_other ?? 15,
                ]);
        }
    }
};
