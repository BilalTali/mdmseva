<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Creates support chat system tables:
     * - support_chats: Chat sessions
     * - support_messages: Individual messages
     * - message_attachments: File uploads
     * - chat_typing_indicators: Real-time typing status
     */
    public function up(): void
    {
        // =====================================================
        // SUPPORT CHATS
        // =====================================================
        Schema::create('support_chats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('subject')->nullable();
            $table->enum('status', ['open', 'resolved', 'closed'])->default('open');
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index('last_message_at');
        });

        // =====================================================
        // SUPPORT MESSAGES
        // =====================================================
        Schema::create('support_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('support_chat_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('message');
            $table->boolean('is_admin')->default(false);
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            $table->index(['support_chat_id', 'created_at']);
            $table->index(['user_id', 'is_read']);
        });

        // =====================================================
        // MESSAGE ATTACHMENTS
        // =====================================================
        Schema::create('message_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('support_message_id')->constrained()->cascadeOnDelete();
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_type')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->timestamps();
            
            $table->index('support_message_id');
        });

        // =====================================================
        // CHAT TYPING INDICATORS (Real-time)
        // =====================================================
        Schema::create('chat_typing_indicators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('support_chat_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_typing')->default(false);
            $table->timestamp('updated_at');
            
            $table->unique(['support_chat_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_typing_indicators');
        Schema::dropIfExists('message_attachments');
        Schema::dropIfExists('support_messages');
        Schema::dropIfExists('support_chats');
    }
};
