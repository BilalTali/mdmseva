<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Create bills table for vendor purchase bills
     * Tracks kiryana (groceries) and fuel bills for each AmountReport
     */
    public function up(): void
    {
        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            
            // =====================================================================
            // RELATIONSHIPS
            // =====================================================================
            $table->foreignId('amount_report_id')
                ->constrained('amount_reports')
                ->cascadeOnDelete()
                ->comment('Link to the amount report this bill belongs to');
            
            $table->foreignId('created_by')
                ->constrained('users')
                ->cascadeOnDelete()
                ->comment('User who created this bill');
            
            // =====================================================================
            // BILL TYPE
            // =====================================================================
            $table->enum('type', ['kiryana', 'fuel'])
                ->comment('Bill type: kiryana (groceries) or fuel (LPG/wood)');
            
            // =====================================================================
            // VENDOR INFORMATION
            // =====================================================================
            $table->string('shop_name')
                ->comment('Vendor shop name');
            
            $table->string('shopkeeper_name')
                ->comment('Vendor/shopkeeper contact person name');
            
            $table->string('phone', 15)
                ->comment('Vendor contact number');
            
            $table->string('address')->nullable()
                ->comment('Vendor shop address (optional)');
            
            // =====================================================================
            // BILL TOTALS
            // =====================================================================
            $table->decimal('total_amount', 10, 2)
                ->default(0)
                ->comment('Total bill amount (sum of all line items)');
            
            // =====================================================================
            // TIMESTAMPS
            // =====================================================================
            $table->timestamps();
            
            // =====================================================================
            // INDEXES
            // =====================================================================
            $table->index('amount_report_id', 'idx_amount_report');
            $table->index('type', 'idx_bill_type');
            $table->index('created_by', 'idx_created_by');
            $table->index('created_at', 'idx_created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};