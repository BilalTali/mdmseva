<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Creates report tables for PDF generation:
     * - rice_reports: Monthly rice consumption reports
     * - amount_reports: Monthly expenditure reports with salt breakdown
     */
    public function up(): void
    {
        // =====================================================
        // RICE REPORTS
        // =====================================================
        Schema::create('rice_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->tinyInteger('month')->comment('1-12');
            $table->smallInteger('year')->comment('2020-2099');
            $table->enum('school_type', ['primary', 'middle', 'secondary']);
            
            // Balance tracking
            $table->decimal('opening_balance', 10, 2)->default(0);
            $table->decimal('closing_balance', 10, 2)->default(0);
            
            // Primary section totals
            $table->integer('total_primary_students')->default(0);
            $table->decimal('total_primary_rice', 10, 2)->default(0);
            
            // Middle section totals
            $table->integer('total_middle_students')->default(0);
            $table->decimal('total_middle_rice', 10, 2)->default(0);
            
            // Grand totals
            $table->decimal('total_rice_consumed', 10, 2)->default(0);
            $table->integer('total_serving_days')->default(0);
            $table->decimal('average_daily_consumption', 10, 2)->default(0);
            
            // Daily breakdown stored as JSON
            $table->json('daily_records')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'year', 'month'], 'user_period_idx');
            $table->index(['user_id', 'created_at'], 'user_created_idx');
            $table->unique(['user_id', 'year', 'month'], 'unique_user_period');
        });

        // =====================================================
        // AMOUNT REPORTS
        // =====================================================
        Schema::create('amount_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // Period
            $table->unsignedSmallInteger('year');
            $table->unsignedTinyInteger('month');
            $table->enum('school_type', ['primary', 'middle', 'secondary']);
            
            // Reference balances
            $table->decimal('opening_balance_primary', 10, 2)->default(0);
            $table->decimal('opening_balance_middle', 10, 2)->default(0);
            $table->decimal('closing_balance_primary', 10, 2)->default(0);
            $table->decimal('closing_balance_middle', 10, 2)->default(0);
            
            // ============ PRIMARY SECTION TOTALS ============
            $table->unsignedInteger('total_primary_students')->default(0);
            $table->decimal('total_primary_pulses', 10, 2)->default(0);
            $table->decimal('total_primary_vegetables', 10, 2)->default(0);
            $table->decimal('total_primary_oil', 10, 2)->default(0);
            $table->decimal('total_primary_salt', 10, 2)->default(0);
            
            // Salt subcategories - Primary
            $table->decimal('total_primary_common_salt', 10, 2)->default(0);
            $table->decimal('total_primary_chilli_powder', 10, 2)->default(0);
            $table->decimal('total_primary_turmeric', 10, 2)->default(0);
            $table->decimal('total_primary_coriander', 10, 2)->default(0);
            $table->decimal('total_primary_other_condiments', 10, 2)->default(0);
            
            $table->decimal('total_primary_fuel', 10, 2)->default(0);
            $table->decimal('total_primary_amount', 10, 2)->default(0);
            
            // ============ MIDDLE SECTION TOTALS ============
            $table->unsignedInteger('total_middle_students')->default(0);
            $table->decimal('total_middle_pulses', 10, 2)->default(0);
            $table->decimal('total_middle_vegetables', 10, 2)->default(0);
            $table->decimal('total_middle_oil', 10, 2)->default(0);
            $table->decimal('total_middle_salt', 10, 2)->default(0);
            
            // Salt subcategories - Middle
            $table->decimal('total_middle_common_salt', 10, 2)->default(0);
            $table->decimal('total_middle_chilli_powder', 10, 2)->default(0);
            $table->decimal('total_middle_turmeric', 10, 2)->default(0);
            $table->decimal('total_middle_coriander', 10, 2)->default(0);
            $table->decimal('total_middle_other_condiments', 10, 2)->default(0);
            
            $table->decimal('total_middle_fuel', 10, 2)->default(0);
            $table->decimal('total_middle_amount', 10, 2)->default(0);
            
            // ============ OVERALL TOTALS ============
            $table->unsignedTinyInteger('total_serving_days')->default(0);
            $table->decimal('grand_total_amount', 10, 2)->default(0);
            $table->decimal('average_daily_amount', 10, 2)->default(0);
            
            // Daily breakdown & salt percentages
            $table->json('daily_records')->nullable();
            $table->json('salt_percentages_used')->nullable()
                ->comment('Salt percentages for historical reference');
            
            $table->timestamps();
            
            // Indexes
            $table->unique(['user_id', 'month', 'year'], 'unique_user_month_year');
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
        Schema::dropIfExists('rice_reports');
    }
};
