<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Creates daily_consumptions table for tracking daily meal consumption.
     */
    public function up(): void
    {
        Schema::create('daily_consumptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // Period
            $table->date('date')->comment('Date of consumption record');
            $table->unsignedTinyInteger('month')->comment('1-12');
            $table->unsignedSmallInteger('year');
            
            // Student counts served
            $table->unsignedInteger('students_primary')->default(0)
                ->comment('Number of primary students served');
            $table->unsignedInteger('students_middle')->default(0)
                ->comment('Number of middle students served');
            
            // Rice consumption (in kilograms)
            $table->decimal('rice_consumed_primary', 10, 2)->default(0);
            $table->decimal('rice_consumed_middle', 10, 2)->default(0);
            $table->decimal('total_rice_consumed', 10, 2)->default(0);
            
            // Amount/cost consumption (in rupees)
            $table->decimal('amount_pulses_primary', 10, 2)->default(0);
            $table->decimal('amount_vegetables_primary', 10, 2)->default(0);
            $table->decimal('amount_oil_primary', 10, 2)->default(0);
            $table->decimal('amount_salt_primary', 10, 2)->default(0);
            $table->decimal('amount_fuel_primary', 10, 2)->default(0);
            $table->decimal('total_amount_primary', 10, 2)->default(0);
            
            $table->decimal('amount_pulses_middle', 10, 2)->default(0);
            $table->decimal('amount_vegetables_middle', 10, 2)->default(0);
            $table->decimal('amount_oil_middle', 10, 2)->default(0);
            $table->decimal('amount_salt_middle', 10, 2)->default(0);
            $table->decimal('amount_fuel_middle', 10, 2)->default(0);
            $table->decimal('total_amount_middle', 10, 2)->default(0);
            
            $table->decimal('grand_total_amount', 10, 2)->default(0)
                ->comment('Total: primary + middle');
            
            // Salt breakdown (JSON for subcategories)
            $table->json('salt_breakdown')->nullable()
                ->comment('Detailed breakdown of salt subcategory amounts');
            
            $table->timestamps();
            
            // Indexes
            $table->unique(['user_id', 'date'], 'unique_user_date');
            $table->index(['user_id', 'year', 'month'], 'idx_user_period');
            $table->index('date', 'idx_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_consumptions');
    }
};
