<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration adds foreign key constraints to existing district_id and zone_id columns
     * These columns were created in the initial users migration
     * This runs AFTER districts and zones tables are created
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add foreign key constraints to existing columns
            // The columns already exist from the initial users migration
            $table->foreign('district_id')
                ->references('id')
                ->on('districts')
                ->onDelete('set null');
                
            $table->foreign('zone_id')
                ->references('id')
                ->on('zones')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop foreign key constraints
            $table->dropForeign(['district_id']);
            $table->dropForeign(['zone_id']);
        });
    }
};