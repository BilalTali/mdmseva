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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            
            // Personal Information
            $table->string('phone', 20);
            $table->date('date_of_birth');
            $table->text('address');
            
            // School Identification
            $table->string('udise', 50)->unique()->comment('Unified District Information System for Education code');
            $table->string('school_name');
            $table->enum('school_type', ['primary', 'middle', 'secondary', 'senior_secondary']);
            $table->text('institute_address');
            $table->string('school_pincode', 10);
            
            // Location (Legacy string fields - kept for backward compatibility)
            $table->string('state', 100);
            $table->string('district', 100);
            $table->string('zone', 100);
            
            // Location (Foreign Keys - will be added in a separate migration after districts/zones are created)
            // These are just placeholders for now - the actual foreign keys will be added later
            $table->unsignedBigInteger('district_id')->nullable()->comment('Foreign key to districts table');
            $table->unsignedBigInteger('zone_id')->nullable()->comment('Foreign key to zones table');
            
            // Account Status
            $table->boolean('is_active')
                ->default(true)
                ->comment('Whether the user account is active');
            
            $table->rememberToken();
            $table->timestamps();
            
            // Indexes for performance (but not foreign key constraints yet)
            $table->index('udise');
            $table->index('district_id');
            $table->index('zone_id');
            $table->index('is_active');
            $table->index(['district_id', 'zone_id']);
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};