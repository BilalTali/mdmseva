<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates roll_statements table (one record per class/date).
     */
    public function up(): void
    {
        Schema::create('roll_statements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('udise', 20)->index();
            $table->string('academic_year', 20);
            $table->date('date')->comment('Date of this roll statement');
            $table->string('class', 10)->comment('Class identifier (kg, 1-12)');

            $table->unsignedInteger('boys')->default(0);
            $table->unsignedInteger('girls')->default(0);
            $table->unsignedInteger('total')->default(0);

            $table->timestamps();

            // Indexes & constraints for quick lookups
            $table->unique(
                ['udise', 'academic_year', 'date', 'class'],
                'unique_udise_year_date_class'
            );
            $table->index(['user_id', 'date'], 'idx_user_date');
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
