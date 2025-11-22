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
        Schema::table('amount_configurations', function (Blueprint $table) {
            // Check if the old unique index exists before dropping
            $exists = count(DB::select("SHOW INDEX FROM amount_configurations WHERE Key_name = 'unique_user_config'")) > 0;
            
            if ($exists) {
                $table->dropUnique('unique_user_config');
            }

            // Check if the new index already exists
            $newExists = count(DB::select("SHOW INDEX FROM amount_configurations WHERE Key_name = 'unique_user_period_config'")) > 0;
            $altExists = count(DB::select("SHOW INDEX FROM amount_configurations WHERE Key_name = 'unique_user_config_per_period'")) > 0;

            if (!$newExists && !$altExists) {
                $table->unique(['user_id', 'year', 'month'], 'unique_user_period_config');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('amount_configurations', function (Blueprint $table) {
            $newExists = count(DB::select("SHOW INDEX FROM amount_configurations WHERE Key_name = 'unique_user_period_config'")) > 0;
            if ($newExists) {
                $table->dropUnique('unique_user_period_config');
            }
            
            $altExists = count(DB::select("SHOW INDEX FROM amount_configurations WHERE Key_name = 'unique_user_config_per_period'")) > 0;
            if ($altExists) {
                $table->dropUnique('unique_user_config_per_period');
            }

            $oldExists = count(DB::select("SHOW INDEX FROM amount_configurations WHERE Key_name = 'unique_user_config'")) > 0;
            if (!$oldExists) {
                // This might fail if duplicates exist, so we wrap in try/catch or just ignore
                try {
                    $table->unique('user_id', 'unique_user_config');
                } catch (\Exception $e) {
                    // Ignore
                }
            }
        });
    }
};
