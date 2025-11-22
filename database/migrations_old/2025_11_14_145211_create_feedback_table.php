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
        Schema::create('feedback', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('school_name')->nullable();
            $table->text('message');
            $table->integer('rating')->default(5); // 1-5 stars
            $table->enum('type', ['general', 'bug_report', 'feature_request', 'support'])->default('general');
            $table->enum('status', ['new', 'in_progress', 'resolved', 'closed'])->default('new');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->text('admin_response')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->unsignedBigInteger('responded_by')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->json('metadata')->nullable(); // For additional data
            $table->timestamps();
            
            // Indexes
            $table->index(['status', 'created_at']);
            $table->index(['type', 'priority']);
            $table->index('email');
            
            // Foreign key for admin who responded
            $table->foreign('responded_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedback');
    }
};
