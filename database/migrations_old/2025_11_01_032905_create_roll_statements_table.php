<?php
// Location: database/migrations/xxxx_xx_xx_create_roll_statements_table.php

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
        Schema::create('roll_statements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->string('udise', 50);
            $table->string('academic_year', 20);
            $table->string('class', 10);
            $table->integer('boys')->default(0);
            $table->integer('girls')->default(0);
            $table->integer('total')->default(0);
            $table->timestamps();

            // Add indexes for better query performance
            $table->index('user_id');
            $table->index('date');
            $table->index('udise');
            $table->index('academic_year');
            $table->index('class');
            $table->index(['user_id', 'date']);
            $table->index(['udise', 'date']);
            $table->index(['date', 'academic_year', 'class']);
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