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

            $table->date('date')->comment('Date of consumption record');
            $table->string('day', 20)->nullable()->comment('Day name');

            $table->unsignedInteger('served_primary')->default(0)->comment('Primary students served');
            $table->unsignedInteger('served_middle')->default(0)->comment('Middle students served');

            $table->decimal('rice_consumed', 10, 2)->default(0)->comment('Total rice consumed (kg)');
            $table->decimal('rice_balance_after', 10, 2)->default(0)->comment('Balance after serving (kg)');

            $table->decimal('amount_consumed', 12, 2)->default(0)->comment('Total amount spent (INR)');

            $table->text('remarks')->nullable();

            $table->timestamps();

            $table->unique(['user_id', 'date'], 'unique_user_date');
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
