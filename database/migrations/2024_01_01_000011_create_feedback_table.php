<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Creates feedback table for user feedback collection.
     */
    public function up(): void
    {
        Schema::create('feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            
            // User details (for anonymous or specific feedback)
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('school_name')->nullable();
            
            // Feedback content
            $table->string('subject')->nullable();
            $table->text('message');
            $table->string('type')->nullable(); // e.g., 'bug', 'feature' (alternative to category)
            $table->enum('category', ['bug', 'feature', 'improvement', 'other'])->default('other');
            $table->enum('priority', ['low', 'normal', 'medium', 'high', 'urgent'])->default('normal');
            $table->unsignedTinyInteger('rating')->nullable();
            
            // Status tracking
            $table->enum('status', ['new', 'pending', 'in_progress', 'reviewed', 'resolved'])->default('new');
            $table->text('admin_response')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->foreignId('responded_by')->nullable()->constrained('users')->nullOnDelete();
            
            // Metadata
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->json('metadata')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'status']);
            $table->index('category');
            $table->index('created_at');
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
