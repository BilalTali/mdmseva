<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Creates all core Laravel framework tables and location tables:
     * - districts & zones (location/geography)
     * - users (with location fields and foreign keys)
     * - password_reset_tokens
     * - sessions
     * - cache & cache_locks
     * - jobs, job_batches, failed_jobs
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

        // =====================================================
        // USERS TABLE
        // =====================================================
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            
            // School/Institution Details
            $table->string('udise_code', 20)->unique()->comment('Unique school identifier');
            $table->string('school_name');
            $table->string('phone', 15)->nullable();
            $table->string('address', 500)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('school_type', ['primary', 'middle', 'secondary', 'senior_secondary'])->default('primary');
            $table->string('institute_address')->nullable();
            $table->string('school_pincode', 10)->nullable();
            
            // Location fields
            $table->string('state')->default('Jammu and Kashmir');
            $table->string('district')->nullable();
            $table->string('zone')->nullable();
            
            // Location foreign keys
            $table->unsignedBigInteger('district_id')->nullable();
            $table->unsignedBigInteger('zone_id')->nullable();
            
            // Status
            $table->enum('status', ['active', 'inactive', 'pending'])->default('pending');
            
            $table->timestamps();
            
            // Indexes
            $table->index('status');
            $table->index(['district_id', 'zone_id']);
            
            // Foreign keys
            $table->foreign('district_id')->references('id')->on('districts')->nullOnDelete();
            $table->foreign('zone_id')->references('id')->on('zones')->nullOnDelete();
        });

        // =====================================================
        // PASSWORD RESET TOKENS
        // =====================================================
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // =====================================================
        // SESSIONS
        // =====================================================
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        // =====================================================
        // CACHE
        // =====================================================
        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        });

        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration');
        });

        // =====================================================
        // QUEUE JOBS
        // =====================================================
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('queue')->index();
            $table->longText('payload');
            $table->unsignedTinyInteger('attempts');
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at');
            $table->unsignedInteger('created_at');
        });

        Schema::create('job_batches', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->integer('total_jobs');
            $table->integer('pending_jobs');
            $table->integer('failed_jobs');
            $table->longText('failed_job_ids');
            $table->mediumText('options')->nullable();
            $table->integer('cancelled_at')->nullable();
            $table->integer('created_at');
            $table->integer('finished_at')->nullable();
        });

        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('failed_jobs');
        Schema::dropIfExists('job_batches');
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('cache_locks');
        Schema::dropIfExists('cache');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
        Schema::dropIfExists('zones');
        Schema::dropIfExists('districts');
    }
};