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
        Schema::table('rice_inventory_activities', function (Blueprint $table) {
            // Drop the old foreign key constraint
            $table->dropForeign(['config_id']);
            
            // Add new foreign key referencing monthly_rice_configurations
            $table->foreign('config_id')
                  ->references('id')
                  ->on('monthly_rice_configurations')
                  ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rice_inventory_activities', function (Blueprint $table) {
            // Drop the monthly config foreign key
            $table->dropForeign(['config_id']);
            
            // Restore the old foreign key
            $table->foreign('config_id')
                  ->references('id')
                  ->on('rice_configurations')
                  ->cascadeOnDelete();
        });
    }
};
