<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Creates roll_statements table for tracking student attendance by class.
     */
    public function up(): void
    {
        Schema::create('roll_statements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // Period
            $table->date('date')->comment('Date of this roll statement');
            $table->unsignedTinyInteger('month')->comment('Month (1-12)');
            $table->unsignedSmallInteger('year')->comment('Year');
            
            // Student counts by class (Classes I-VIII)
            $table->unsignedInteger('class_i')->default(0);
            $table->unsignedInteger('class_ii')->default(0);
            $table->unsignedInteger('class_iii')->default(0);
            $table->unsignedInteger('class_iv')->default(0);
            $table->unsignedInteger('class_v')->default(0);
            $table->unsignedInteger('class_vi')->default(0);
            $table->unsignedInteger('class_vii')->default(0);
            $table->unsignedInteger('class_viii')->default(0);
            
            // Aggregates
            $table->unsignedInteger('total_primary')->default(0)->comment('Sum of classes I-V');
            $table->unsignedInteger('total_middle')->default(0)->comment('Sum of classes VI-VIII');
            $table->unsignedInteger('grand_total')->default(0)->comment('All classes total');
            
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
        Schema::dropIfExists('roll_statements');
    }
};
