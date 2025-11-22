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
        // Create districts table
        Schema::create('districts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('state', ['Jammu and Kashmir', 'Ladakh']);
            $table->string('code')->unique();
            $table->timestamps();
            
            // Indexes for filtering
            $table->index('state');
            $table->index('name');
        });

        // Create zones table
        Schema::create('zones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('district_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('code')->unique();
            $table->timestamps();
            
            // Index for filtering
            $table->index('district_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zones');
        Schema::dropIfExists('districts');
    }
};