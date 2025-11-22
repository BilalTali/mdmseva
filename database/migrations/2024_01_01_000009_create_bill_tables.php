<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Creates bill tables for Kiryana and Fuel bill management:
     * - bills: Bill headers
     * - bill_items: Individual line items
     */
    public function up(): void
    {
        // =====================================================
        // BILLS
        // =====================================================
        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // Bill metadata
            $table->string('bill_number')->unique();
            $table->enum('bill_type', ['kiryana', 'fuel']);
            
            // Period
            $table->unsignedTinyInteger('month')->comment('1-12');
            $table->unsignedSmallInteger('year');
            
            // Related report (for pre-filling from amount reports)
            $table->foreignId('amount_report_id')->nullable()
                  ->constrained('amount_reports')->nullOnDelete();
            
            // Totals
            $table->decimal('sub_total', 10, 2)->default(0);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('grand_total', 10, 2)->default(0);
            
            // Status
            $table->enum('status', ['draft', 'submitted', 'approved', 'rejected'])->default('draft');
            $table->text('notes')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'bill_type', 'year', 'month']);
            $table->index('status');
        });

        // =====================================================
        // BILL ITEMS
        // =====================================================
        Schema::create('bill_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bill_id')->constrained()->cascadeOnDelete();
            
            // Item details
            $table->string('item_name');
            $table->text('description')->nullable();
            $table->decimal('quantity', 10, 2)->default(0);
            $table->string('unit')->nullable()->comment('kg, liters, pieces, etc.');
            $table->decimal('unit_price', 10, 2)->default(0);
            $table->decimal('total_price', 10, 2)->default(0);
            
            $table->timestamps();
            
            // Indexes
            $table->index('bill_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bill_items');
        Schema::dropIfExists('bills');
    }
};
