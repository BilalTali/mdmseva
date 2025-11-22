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
        Schema::create('daily_consumptions', function (Blueprint $table) {
            $table->id();
            
            // Foreign key
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Date fields
            $table->date('date');
            $table->string('day'); // e.g., "Monday", "Tuesday"
            
            // Student counts (school-type dependent)
            $table->integer('served_primary')->nullable()->comment('Primary students served (I-V)');
            $table->integer('served_middle')->nullable()->comment('Middle students served (VI-VIII)');
            
            // Consumption values (calculated and stored)
            $table->decimal('rice_consumed', 10, 2)->comment('Total rice consumed in kg');
            $table->decimal('rice_balance_after', 10, 2)->default(0)->comment('Remaining rice stock after this consumption');
            $table->decimal('amount_consumed', 10, 2)->default(0)->comment('Total amount consumed in rupees');
            
            // Additional info
            $table->text('remarks')->nullable();
            
            // Timestamps
            $table->timestamps();
            
            // ============================================
            // CONSTRAINTS
            // ============================================
            
            // Prevent duplicate entries per user per date
            // This also creates an index automatically
            $table->unique(['user_id', 'date']);
            
            // ============================================
            // PERFORMANCE INDEXES
            // ============================================
            
            // Index for pagination and recent records queries
            // Optimizes: ->where('user_id', $id)->latest()->paginate()
            $table->index(['user_id', 'created_at'], 'idx_user_created');
            
            // Index for date-range queries across all users
            // Optimizes: admin reports, analytics, cross-school comparisons
            $table->index('date', 'idx_date');
            
            // Optional: Uncomment if you implement low stock monitoring
            // $table->index(['user_id', 'rice_balance_after'], 'idx_user_balance');
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