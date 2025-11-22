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
            
            // Indexes for performance
            $table->index(['user_id', 'year', 'month'], 'user_period_idx');
            $table->index(['user_id', 'created_at'], 'user_created_idx');
            
            // Unique constraint: one report per user per month
            $table->unique(['user_id', 'year', 'month'], 'unique_user_period');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rice_reports');
    }
};