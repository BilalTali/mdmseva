<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Create bill_items table for individual line items in bills
     * Each bill can have multiple items (pulses, oil, vegetables, etc.)
     */
    public function up(): void
    {
        Schema::create('bill_items', function (Blueprint $table) {
            $table->id();
            
            // =====================================================================
            // RELATIONSHIPS
            // =====================================================================
            $table->foreignId('bill_id')
                ->constrained('bills')
                ->cascadeOnDelete()
                ->comment('Link to parent bill');
            
            // =====================================================================
            // ITEM DETAILS
            // =====================================================================
            $table->string('item_name')
                ->comment('Item name (e.g., Pulses, Common Salt, LPG, Chilli Powder)');
            
            $table->decimal('amount', 10, 2)
                ->default(0)
                ->comment('Total amount for this item (from AmountReport)');
            
            $table->decimal('rate_per_unit', 10, 2)
                ->default(0)
                ->comment('Rate per unit (₹ per kg/litre/quintal)');
            
            $table->decimal('quantity', 10, 2)
                ->default(0)
                ->comment('Quantity purchased (calculated as amount ÷ rate)');
            
            $table->string('unit', 20)
                ->default('kg')
                ->comment('Unit of measurement (kg, litre, quintal, etc.)');
            
            // =====================================================================
            // TIMESTAMPS
            // =====================================================================
            $table->timestamps();
            
            // =====================================================================
            // INDEXES
            // =====================================================================
            $table->index('bill_id', 'idx_bill_id');
            $table->index('item_name', 'idx_item_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bill_items');
    }
};