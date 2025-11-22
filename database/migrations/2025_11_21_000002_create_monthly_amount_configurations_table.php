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
            
            // Locking
            $table->boolean('is_locked')->default(false);
            
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
    }
};
