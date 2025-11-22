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
        Schema::create('rice_configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // School type
            $table->enum('school_type', ['primary', 'middle', 'secondary', 'senior_secondary'])
                  ->default('primary');
            
            // Default consumption (in grams per student per day)
            $table->unsignedInteger('default_daily_consumption_per_student_primary')->default(100);
            $table->unsignedInteger('default_daily_consumption_per_student_upper_primary')->default(150);
            
            // Balances (in kilograms, 2 decimal places)
            // Primary group
            $table->decimal('opening_balance_primary', 10, 2)->default(0);
            $table->decimal('rice_lifted_primary', 10, 2)->default(0);
            $table->decimal('rice_arranged_primary', 10, 2)->default(0); // Rice from alternative sources
            $table->decimal('total_available_primary', 10, 2)->default(0);
            $table->decimal('consumed_primary', 10, 2)->default(0);
            $table->decimal('closing_balance_primary', 10, 2)->default(0);
            
            // Upper primary group
            $table->decimal('opening_balance_upper_primary', 10, 2)->default(0);
            $table->decimal('rice_lifted_upper_primary', 10, 2)->default(0);
            $table->decimal('rice_arranged_upper_primary', 10, 2)->default(0); // Rice from alternative sources
            $table->decimal('total_available_upper_primary', 10, 2)->default(0);
            $table->decimal('consumed_upper_primary', 10, 2)->default(0);
            $table->decimal('closing_balance_upper_primary', 10, 2)->default(0);
            
            // Tracking fields
            $table->unsignedTinyInteger('last_updated_month')->default(1); // 1-12
            $table->unsignedSmallInteger('last_updated_year')->default(2025);
            
            // Settings
            $table->boolean('auto_carry_forward')->default(true);
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            
            // Indexes
            $table->unique('user_id'); // One configuration per user
            $table->index(['last_updated_year', 'last_updated_month']);
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rice_configurations');
    }
};