<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Creates monthly tracking tables:
     * - monthly_configurations: Overall month status tracking
     * - month_completions: Month-end completion records
     */
    public function up(): void
    {
        // =====================================================
        // MONTHLY CONFIGURATIONS (Month Status Tracking)
        // =====================================================
        Schema::create('monthly_configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // Period tracking
            $table->unsignedTinyInteger('month')->comment('Month (1-12)');
            $table->unsignedSmallInteger('year')->comment('Year (2020-2100)');
            
            // Configuration completion status
            $table->boolean('rice_config_completed')->default(false)
                ->comment('Whether rice configuration has been completed for this month');
            $table->boolean('amount_config_completed')->default(false)
                ->comment('Whether amount configuration has been completed for this month');
            
            // Opening balances (transferred from previous month's closing)
            $table->decimal('opening_balance_primary', 10, 2)->default(0)
                ->comment('Opening balance for primary from previous month closing');
            $table->decimal('opening_balance_upper_primary', 10, 2)->default(0)
                ->comment('Opening balance for upper primary from previous month closing');
            
            // Closing balances (calculated at month end)
            $table->decimal('closing_balance_primary', 10, 2)->default(0)
                ->comment('Closing balance for primary at end of month');
            $table->decimal('closing_balance_upper_primary', 10, 2)->default(0)
                ->comment('Closing balance for upper primary at end of month');
            
            $table->timestamps();
            
            // Constraints and Indexes
            $table->unique(['user_id', 'month', 'year'], 'unique_user_month_year');
            $table->index(['year', 'month'], 'idx_year_month');
            $table->index(['user_id', 'rice_config_completed', 'amount_config_completed'], 'idx_config_status');
        });

        // =====================================================
        // MONTH COMPLETIONS (Month-End Records)
        // =====================================================
        Schema::create('month_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // Period
            $table->unsignedTinyInteger('month')->comment('1-12');
            $table->unsignedSmallInteger('year');
            
            // Completion tracking
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('completed_by')->nullable()->constrained('users');
            
            // Summary statistics
            $table->unsignedInteger('total_days_served')->default(0);
            $table->decimal('total_rice_consumed', 10, 2)->default(0);
            $table->decimal('total_amount_spent', 10, 2)->default(0);
            
            // Notes
            $table->text('notes')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->unique(['user_id', 'year', 'month'], 'unique_user_month');
            $table->index(['user_id', 'is_completed']);
            $table->index(['year', 'month']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('month_completions');
        Schema::dropIfExists('monthly_configurations');
    }
};
