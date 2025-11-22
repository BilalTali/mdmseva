<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Create amount_reports table for monthly aggregated amount consumption reports
     * Includes salt percentages tracking for historical reference
     */
    public function up(): void
    {
        Schema::create('amount_reports', function (Blueprint $table) {
            $table->id();
            
            // =====================================================================
            // METADATA & IDENTIFIERS
            // =====================================================================
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete()
                ->comment('School/user who owns this report');
            
            $table->unsignedSmallInteger('year')
                ->comment('Report year (e.g., 2024)');
            
            $table->unsignedTinyInteger('month')
                ->comment('Report month (1-12)');
            
            $table->enum('school_type', ['primary', 'middle', 'secondary'])
                ->comment('School type: primary (I-V), middle (I-VIII), secondary (VI-VIII)');
            
            // =====================================================================
            // REFERENCE BALANCES (From AmountConfiguration)
            // =====================================================================
            $table->decimal('opening_balance_primary', 10, 2)
                ->default(0)
                ->comment('Opening balance for primary section at start of month');
            
            $table->decimal('opening_balance_middle', 10, 2)
                ->default(0)
                ->comment('Opening balance for middle section at start of month');
            
            $table->decimal('closing_balance_primary', 10, 2)
                ->default(0)
                ->comment('Closing balance for primary section at end of month');
            
            $table->decimal('closing_balance_middle', 10, 2)
                ->default(0)
                ->comment('Closing balance for middle section at end of month');
            
            // =====================================================================
            // PRIMARY SECTION TOTALS (Classes I-V)
            // =====================================================================
            $table->unsignedInteger('total_primary_students')
                ->default(0)
                ->comment('Total primary students served in the month');
            
            $table->decimal('total_primary_pulses', 10, 2)
                ->default(0)
                ->comment('Total pulses consumed by primary (kg or ₹)');
            
            $table->decimal('total_primary_vegetables', 10, 2)
                ->default(0)
                ->comment('Total vegetables consumed by primary');
            
            $table->decimal('total_primary_oil', 10, 2)
                ->default(0)
                ->comment('Total oil consumed by primary');
            
            $table->decimal('total_primary_salt', 10, 2)
                ->default(0)
                ->comment('Total OVERALL salt consumed by primary (sum of subcategories)');
            
            // Salt Subcategories for Primary
            $table->decimal('total_primary_common_salt', 10, 2)
                ->default(0)
                ->comment('Total common salt for primary');
            
            $table->decimal('total_primary_chilli_powder', 10, 2)
                ->default(0)
                ->comment('Total chilli powder for primary');
            
            $table->decimal('total_primary_turmeric', 10, 2)
                ->default(0)
                ->comment('Total turmeric for primary');
            
            $table->decimal('total_primary_coriander', 10, 2)
                ->default(0)
                ->comment('Total coriander for primary');
            
            $table->decimal('total_primary_other_condiments', 10, 2)
                ->default(0)
                ->comment('Total other condiments for primary');
            
            $table->decimal('total_primary_fuel', 10, 2)
                ->default(0)
                ->comment('Total fuel consumed by primary');
            
            $table->decimal('total_primary_amount', 10, 2)
                ->default(0)
                ->comment('Grand total amount for primary section');
            
            // =====================================================================
            // MIDDLE SECTION TOTALS (Classes VI-VIII)
            // =====================================================================
            $table->unsignedInteger('total_middle_students')
                ->default(0)
                ->comment('Total middle students served in the month');
            
            $table->decimal('total_middle_pulses', 10, 2)
                ->default(0)
                ->comment('Total pulses consumed by middle');
            
            $table->decimal('total_middle_vegetables', 10, 2)
                ->default(0)
                ->comment('Total vegetables consumed by middle');
            
            $table->decimal('total_middle_oil', 10, 2)
                ->default(0)
                ->comment('Total oil consumed by middle');
            
            $table->decimal('total_middle_salt', 10, 2)
                ->default(0)
                ->comment('Total OVERALL salt consumed by middle (sum of subcategories)');
            
            // Salt Subcategories for Middle
            $table->decimal('total_middle_common_salt', 10, 2)
                ->default(0)
                ->comment('Total common salt for middle');
            
            $table->decimal('total_middle_chilli_powder', 10, 2)
                ->default(0)
                ->comment('Total chilli powder for middle');
            
            $table->decimal('total_middle_turmeric', 10, 2)
                ->default(0)
                ->comment('Total turmeric for middle');
            
            $table->decimal('total_middle_coriander', 10, 2)
                ->default(0)
                ->comment('Total coriander for middle');
            
            $table->decimal('total_middle_other_condiments', 10, 2)
                ->default(0)
                ->comment('Total other condiments for middle');
            
            $table->decimal('total_middle_fuel', 10, 2)
                ->default(0)
                ->comment('Total fuel consumed by middle');
            
            $table->decimal('total_middle_amount', 10, 2)
                ->default(0)
                ->comment('Grand total amount for middle section');
            
            // =====================================================================
            // OVERALL REPORT TOTALS
            // =====================================================================
            $table->unsignedTinyInteger('total_serving_days')
                ->default(0)
                ->comment('Number of days meals were served in this month');
            
            $table->decimal('grand_total_amount', 10, 2)
                ->default(0)
                ->comment('Grand total: primary + middle amounts');
            
            $table->decimal('average_daily_amount', 10, 2)
                ->default(0)
                ->comment('Average amount consumed per day (grand_total / serving_days)');
            
            // =====================================================================
            // DAILY BREAKDOWN & SALT PERCENTAGES (JSON)
            // =====================================================================
            $table->json('daily_records')
                ->nullable()
                ->comment('Array of daily breakdowns with date, students, and category amounts');
            
            $table->json('salt_percentages_used')
                ->nullable()
                ->comment('Salt percentages used for this report (for historical reference)');
            
            // =====================================================================
            // TIMESTAMPS
            // =====================================================================
            $table->timestamps();
            
            // =====================================================================
            // INDEXES
            // =====================================================================
            // Unique constraint: One report per user per month/year
            $table->unique(['user_id', 'month', 'year'], 'unique_user_month_year');
            
            // Query optimization indexes
            $table->index(['year', 'month'], 'idx_period');
            $table->index('school_type', 'idx_school_type');
            $table->index('created_at', 'idx_created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('amount_reports');
    }
};