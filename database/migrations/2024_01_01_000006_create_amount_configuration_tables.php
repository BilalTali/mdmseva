<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Creates amount configuration tables:
     * - amount_configurations: Base cooking cost rates with salt percentages
     * - monthly_amount_configurations: Monthly financial tracking
     */
    public function up(): void
    {
        // =====================================================
        // AMOUNT CONFIGURATIONS (Base Rates)
        // =====================================================
        Schema::create('amount_configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // Period
            $table->unsignedSmallInteger('year');
            $table->unsignedTinyInteger('month');
            
            // ============ PRIMARY SECTION RATES (Classes I-V) ============
            $table->decimal('daily_pulses_primary', 10, 2)->default(0);
            $table->decimal('daily_vegetables_primary', 10, 2)->default(0);
            $table->decimal('daily_oil_primary', 10, 2)->default(0);
            $table->decimal('daily_salt_primary', 10, 2)->default(0.75)
                ->comment('Total salt rate (sum of subcategories)');
            
            // Salt subcategories - Primary
            $table->decimal('daily_common_salt_primary', 10, 2)->default(0);
            $table->decimal('daily_chilli_powder_primary', 10, 2)->default(0);
            $table->decimal('daily_turmeric_primary', 10, 2)->default(0);
            $table->decimal('daily_coriander_primary', 10, 2)->default(0);
            $table->decimal('daily_other_condiments_primary', 10, 2)->default(0);
            
            // Iodized salt fields (added later)
            $table->decimal('daily_salt_iodized_primary', 10, 2)->default(0)
                ->comment('Daily iodized salt rate for primary');
            
            $table->decimal('daily_fuel_primary', 10, 2)->default(0);
            $table->decimal('total_daily_primary', 10, 2)->default(0)
                ->comment('Total daily rate per student for primary');
            
            // ============ MIDDLE SECTION RATES (Classes VI-VIII) ============
            $table->decimal('daily_pulses_middle', 10, 2)->default(0);
            $table->decimal('daily_vegetables_middle', 10, 2)->default(0);
            $table->decimal('daily_oil_middle', 10, 2)->default(0);
            $table->decimal('daily_salt_middle', 10, 2)->default(1.00)
                ->comment('Total salt rate (sum of subcategories)');
            
            // Salt subcategories - Middle
            $table->decimal('daily_common_salt_middle', 10, 2)->default(0);
            $table->decimal('daily_chilli_powder_middle', 10, 2)->default(0);
            $table->decimal('daily_turmeric_middle', 10, 2)->default(0);
            $table->decimal('daily_coriander_middle', 10, 2)->default(0);
            $table->decimal('daily_other_condiments_middle', 10, 2)->default(0);
            
            // Iodized salt fields (added later)
            $table->decimal('daily_salt_iodized_middle', 10, 2)->default(0)
                ->comment('Daily iodized salt rate for middle');
            
            $table->decimal('daily_fuel_middle', 10, 2)->default(0);
            $table->decimal('total_daily_middle', 10, 2)->default(0)
                ->comment('Total daily rate per student for middle');
            
            // ============ UNIFIED SALT PERCENTAGES ============
            // Apply to both Primary and Middle sections
            $table->decimal('salt_percentage_common', 5, 2)->default(30.00);
            $table->decimal('salt_percentage_chilli', 5, 2)->default(20.00);
            $table->decimal('salt_percentage_turmeric', 5, 2)->default(20.00);
            $table->decimal('salt_percentage_coriander', 5, 2)->default(15.00);
            $table->decimal('salt_percentage_other', 5, 2)->default(15.00);
            
            // ============ LOCK/UNLOCK TRACKING ============
            $table->boolean('is_locked')->default(false);
            $table->timestamp('locked_at')->nullable();
            $table->foreignId('locked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('lock_reason')->nullable();
            $table->timestamp('unlocked_at')->nullable();
            $table->foreignId('unlocked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('unlock_reason')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->unique(['user_id', 'year', 'month'], 'unique_user_config');
            $table->index(['year', 'month'], 'idx_year_month');
        });

        // =====================================================
        // MONTHLY AMOUNT CONFIGURATIONS (Financial Tracking)
        // =====================================================
        Schema::create('monthly_amount_configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->tinyInteger('month')->comment('1-12');
            $table->smallInteger('year')->comment('2020-2100');
            
            // Amount rates (rupees per student per day)
            $table->decimal('daily_amount_per_student_primary', 10, 2)->default(0);
            $table->decimal('daily_amount_per_student_upper_primary', 10, 2)->default(0);
            
            // Primary section balances
            $table->decimal('opening_balance_primary', 10, 2)->default(0);
            $table->decimal('amount_received_primary', 10, 2)->default(0);
            $table->decimal('total_available_primary', 10, 2)->default(0);
            $table->decimal('consumed_primary', 10, 2)->default(0);
            $table->decimal('closing_balance_primary', 10, 2)->default(0);
            
            // Upper primary/middle section balances
            $table->decimal('opening_balance_upper_primary', 10, 2)->default(0);
            $table->decimal('amount_received_upper_primary', 10, 2)->default(0);
            $table->decimal('total_available_upper_primary', 10, 2)->default(0);
            $table->decimal('consumed_upper_primary', 10, 2)->default(0);
            $table->decimal('closing_balance_upper_primary', 10, 2)->default(0);
            
            // Status tracking
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('completed_by')->nullable()->constrained('users');
            
            // Carried forward flags
            $table->boolean('opening_carried_from_previous')->default(false);
            $table->foreignId('previous_month_id')->nullable()
                  ->references('id')->on('monthly_amount_configurations')
                  ->nullOnDelete();
            
            // ============ LOCK/UNLOCK TRACKING ============
            $table->boolean('is_locked')->default(false);
            $table->timestamp('locked_at')->nullable();
            $table->foreignId('locked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('lock_reason')->nullable();
            $table->timestamp('unlocked_at')->nullable();
            $table->foreignId('unlocked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('unlock_reason')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->unique(['user_id', 'year', 'month'], 'unique_user_month');
            $table->index(['user_id', 'year', 'month'], 'idx_user_period');
            $table->index('is_completed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monthly_amount_configurations');
        Schema::dropIfExists('amount_configurations');
    }
};
