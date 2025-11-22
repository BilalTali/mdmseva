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
        Schema::create('month_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->tinyInteger('month')->comment('1-12');
            $table->smallInteger('year')->comment('2020-2100');
            
            // Configuration references
            $table->foreignId('rice_config_id')->nullable()
                  ->constrained('monthly_rice_configurations')
                  ->nullOnDelete();
            $table->foreignId('amount_config_id')->nullable()
                  ->constrained('monthly_amount_configurations')
                  ->nullOnDelete();
            
            // Rice closing balances
            $table->decimal('rice_closing_balance_primary', 10, 2)->nullable();
            $table->decimal('rice_closing_balance_upper_primary', 10, 2)->nullable();
            
            // Amount closing balances
            $table->decimal('amount_closing_balance_primary', 10, 2)->nullable();
            $table->decimal('amount_closing_balance_upper_primary', 10, 2)->nullable();
            
            // Statistics
            $table->integer('total_consumption_days')->default(0);
            $table->decimal('total_rice_consumed', 10, 2)->default(0);
            $table->decimal('total_amount_consumed', 10, 2)->default(0);
            
            // Completion tracking
            $table->timestamp('completed_at');
            $table->foreignId('completed_by')->constrained('users');
            $table->text('notes')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->unique(['user_id', 'year', 'month'], 'unique_user_month_completion');
            $table->index('completed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('month_completions');
    }
};
