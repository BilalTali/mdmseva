<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Creates developer_messages table for managing developer team messages.
     */
    public function up(): void
    {
        Schema::create('developer_messages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('message');
            $table->string('image_path')->nullable();
            $table->boolean('status')->default(false); // 0 = inactive, 1 = active
            $table->timestamps();
            
            // Indexes for performance
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('developer_messages');
    }
};
