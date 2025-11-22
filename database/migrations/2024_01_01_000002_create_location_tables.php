<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Creates location/geography tables for school organization.
     */
    public function up(): void
    {
        // =====================================================
        // DISTRICTS TABLE
        // =====================================================
        Schema::create('districts', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('code', 10)->unique()->nullable();
            $table->string('state')->default('Jammu and Kashmir');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('is_active');
        });

        // =====================================================
        // ZONES TABLE
        // =====================================================
        Schema::create('zones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('district_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code', 10)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['district_id', 'is_active']);
            $table->unique(['district_id', 'name']);
        });

        // Add foreign keys to users table now that districts/zones exist
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('district_id')->references('id')->on('districts')->nullOnDelete();
            $table->foreign('zone_id')->references('id')->on('zones')->nullOnDelete();
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
