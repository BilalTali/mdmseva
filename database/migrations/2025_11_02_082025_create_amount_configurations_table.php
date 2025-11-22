<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Creates amount_configurations table with salt subcategories and unified salt percentages
     */
    public function up(): void
    {
        Schema::create('amount_configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // =====================================================================
            // PERIOD
            // =====================================================================
            $table->unsignedSmallInteger('year');
            $table->unsignedTinyInteger('month');
            
            // =====================================================================
            // PRIMARY SECTION RATES (Classes I-V)
            // =====================================================================
            $table->decimal('daily_pulses_primary', 10, 2)
                ->default(0)
                ->comment('Daily pulses rate per student for primary');
            
            $table->decimal('daily_vegetables_primary', 10, 2)
                ->default(0)
                ->comment('Daily vegetables rate per student for primary');
            
            $table->decimal('daily_oil_primary', 10, 2)
                ->default(0)
                ->comment('Daily oil rate per student for primary');
            
            $table->decimal('daily_salt_primary', 10, 2)
                ->default(0.75)
                ->comment('Daily TOTAL salt rate per student for primary (sum of subcategories)');
            
            // Salt Subcategories for Primary
            $table->decimal('daily_common_salt_primary', 10, 2)
                ->default(0)
                ->comment('Daily common salt rate per student for primary');
            
            $table->decimal('daily_chilli_powder_primary', 10, 2)
                ->default(0)
                ->comment('Daily chilli powder rate per student for primary');
            
            $table->decimal('daily_turmeric_primary', 10, 2)
                ->default(0)
                ->comment('Daily turmeric rate per student for primary');
            
            $table->decimal('daily_coriander_primary', 10, 2)
                ->default(0)
                ->comment('Daily coriander rate per student for primary');
            
            $table->decimal('daily_other_condiments_primary', 10, 2)
                ->default(0)
                ->comment('Daily other condiments rate per student for primary');
            
            $table->decimal('daily_fuel_primary', 10, 2)
                ->default(0)
                ->comment('Daily fuel rate per student for primary');
            
            $table->decimal('total_daily_primary', 10, 2)
                ->default(0)
                ->comment('Total daily rate per student for primary section');
            
            // =====================================================================
            // MIDDLE SECTION RATES (Classes VI-VIII)
            // =====================================================================
            $table->decimal('daily_pulses_middle', 10, 2)
                ->default(0)
                ->comment('Daily pulses rate per student for middle');
            
            $table->decimal('daily_vegetables_middle', 10, 2)
                ->default(0)
                ->comment('Daily vegetables rate per student for middle');
            
            $table->decimal('daily_oil_middle', 10, 2)
                ->default(0)
                ->comment('Daily oil rate per student for middle');
            
            $table->decimal('daily_salt_middle', 10, 2)
                ->default(1.00)
                ->comment('Daily TOTAL salt rate per student for middle (sum of subcategories)');
            
            // Salt Subcategories for Middle
            $table->decimal('daily_common_salt_middle', 10, 2)
                ->default(0)
                ->comment('Daily common salt rate per student for middle');
            
            $table->decimal('daily_chilli_powder_middle', 10, 2)
                ->default(0)
                ->comment('Daily chilli powder rate per student for middle');
            
            $table->decimal('daily_turmeric_middle', 10, 2)
                ->default(0)
                ->comment('Daily turmeric rate per student for middle');
            
            $table->decimal('daily_coriander_middle', 10, 2)
                ->default(0)
                ->comment('Daily coriander rate per student for middle');
            
            $table->decimal('daily_other_condiments_middle', 10, 2)
                ->default(0)
                ->comment('Daily other condiments rate per student for middle');
            
            $table->decimal('daily_fuel_middle', 10, 2)
                ->default(0)
                ->comment('Daily fuel rate per student for middle');
            
            $table->decimal('total_daily_middle', 10, 2)
                ->default(0)
                ->comment('Total daily rate per student for middle section');
            
            // =====================================================================
            // UNIFIED SALT PERCENTAGES (Apply to both Primary and Middle)
            // =====================================================================
            $table->decimal('salt_percentage_common', 5, 2)
                ->default(30.00)
                ->comment('Percentage of common salt in total salt allocation');
            
            $table->decimal('salt_percentage_chilli', 5, 2)
                ->default(20.00)
                ->comment('Percentage of chilli powder in total salt allocation');
            
            $table->decimal('salt_percentage_turmeric', 5, 2)
                ->default(20.00)
                ->comment('Percentage of turmeric in total salt allocation');
            
            $table->decimal('salt_percentage_coriander', 5, 2)
                ->default(15.00)
                ->comment('Percentage of coriander in total salt allocation');
            
            $table->decimal('salt_percentage_other', 5, 2)
                ->default(15.00)
                ->comment('Percentage of other condiments in total salt allocation');
            
            // =====================================================================
            // TIMESTAMPS
            // =====================================================================
            $table->timestamps();
            
            // =====================================================================
            // INDEXES
            // =====================================================================
            $table->unique('user_id', 'unique_user_config');
            $table->index(['year', 'month'], 'idx_year_month');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('amount_configurations');
    }
};