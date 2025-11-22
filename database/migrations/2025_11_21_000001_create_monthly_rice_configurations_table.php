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
        Schema::create('monthly_rice_configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->tinyInteger('month')->comment('1-12');
            $table->smallInteger('year')->comment('2020-2100');
            
            // School configuration
            $table->enum('school_type', ['primary', 'middle', 'secondary', 'senior_secondary'])
                  ->default('primary');
            
            // Consumption rates (grams per student per day)
            $table->unsignedInteger('daily_consumption_primary')->default(100);
            $table->unsignedInteger('daily_consumption_upper_primary')->default(150);
            
            // Primary section (kg)
            $table->decimal('opening_balance_primary', 10, 2)->default(0);
            $table->decimal('rice_lifted_primary', 10, 2)->default(0);
            $table->decimal('rice_arranged_primary', 10, 2)->default(0);
            $table->decimal('total_available_primary', 10, 2)->default(0);
            $table->decimal('consumed_primary', 10, 2)->default(0);
            $table->decimal('closing_balance_primary', 10, 2)->default(0);
            
            // Upper primary/middle section (kg)
            $table->decimal('opening_balance_upper_primary', 10, 2)->default(0);
            $table->decimal('rice_lifted_upper_primary', 10, 2)->default(0);
            $table->decimal('rice_arranged_upper_primary', 10, 2)->default(0);
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
                  ->references('id')->on('monthly_rice_configurations')
                  ->nullOnDelete();
            
            // Locking mechanism
            $table->boolean('is_locked')->default(false);
            $table->text('locked_reason')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->unique(['user_id', 'year', 'month'], 'unique_user_month');
            $table->index(['user_id', 'year', 'month'], 'idx_user_period');
            $table->index(['is_completed', 'is_locked'], 'idx_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monthly_rice_configurations');
    }
};
