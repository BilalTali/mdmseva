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
        Schema::create('rice_inventory_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('config_id')
                  ->constrained('rice_configurations')
                  ->cascadeOnDelete();
            
            // Period
            $table->unsignedTinyInteger('month'); // 1-12
            $table->unsignedSmallInteger('year');
            
            // Action type (must match RiceInventoryActivity action constants)
            $table->enum('action', [
                'opened',
                'lifted',
                'arranged',
                'consumed',
                'adjusted',
                'carried_forward',
                'reset',
                'edited',
                'synced',
            ]);
            
            // Amounts (in kilograms)
            $table->decimal('amount_primary', 10, 2)->default(0);
            $table->decimal('amount_upper_primary', 10, 2)->default(0);
            
            // Additional info
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['config_id', 'year', 'month']);
            $table->index(['user_id', 'created_at']);
            $table->index('action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rice_inventory_activities');
    }
};