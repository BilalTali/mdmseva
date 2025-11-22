<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Drop the orphaned rice_configurations table.
     * This table was created on 2025-11-02 but never used in production.
     * The system switched to monthly_rice_configurations immediately.
     * 
     * Evidence:
     * - No RiceConfiguration model exists
     * - Not referenced in any controller
     * - Routes comment: "DEPRECATED: Using Monthly System"
     */
    public function up(): void
    {
        Schema::dropIfExists('rice_configurations');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate table if rollback needed
        // Structure from 2025_11_02_063803_create_rice_configurations_table.php
        Schema::create('rice_configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            $table->enum('school_type', ['primary', 'middle', 'secondary', 'senior_secondary'])->default('primary');
            
            $table->unsignedInteger('default_daily_consumption_per_student_primary')->default(100);
            $table->unsignedInteger('default_daily_consumption_per_student_upper_primary')->default(150);
            
            $table->decimal('opening_balance_primary', 10, 2)->default(0);
            $table->decimal('rice_lifted_primary', 10, 2)->default(0);
            $table->decimal('rice_arranged_primary', 10, 2)->default(0);
            $table->decimal('total_available_primary', 10, 2)->default(0);
            $table->decimal('consumed_primary', 10, 2)->default(0);
            $table->decimal('closing_balance_primary', 10, 2)->default(0);
            
            $table->decimal('opening_balance_upper_primary', 10, 2)->default(0);
            $table->decimal('rice_lifted_upper_primary', 10, 2)->default(0);
            $table->decimal('rice_arranged_upper_primary', 10, 2)->default(0);
            $table->decimal('total_available_upper_primary', 10, 2)->default(0);
            $table->decimal('consumed_upper_primary', 10, 2)->default(0);
            $table->decimal('closing_balance_upper_primary', 10, 2)->default(0);
            
            $table->unsignedTinyInteger('last_updated_month')->default(1);
            $table->unsignedSmallInteger('last_updated_year')->default(2025);
            $table->boolean('auto_carry_forward')->default(true);
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            
            $table->unique('user_id');
            $table->index(['last_updated_year', 'last_updated_month']);
            $table->index('is_active');
        });
    }
};
