<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('amount_configurations', function (Blueprint $table) {
            if (Schema::hasTable('amount_configurations')) {
                $table->dropUnique('unique_user_config');
                $table->unique(['user_id', 'year', 'month'], 'unique_user_config_per_period');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('amount_configurations', function (Blueprint $table) {
            if (Schema::hasTable('amount_configurations')) {
                $table->dropUnique('unique_user_config_per_period');
                $table->unique('user_id', 'unique_user_config');
            }
        });
    }
};
