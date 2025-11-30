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
        Schema::create('ai_configurations', function (Blueprint $table) {
            $table->id();
            $table->text('system_prompt')->nullable();
            $table->boolean('is_enabled')->default(true);
            $table->boolean('auto_respond')->default(true);
            $table->integer('max_tokens')->default(1024);
            $table->decimal('temperature', 3, 2)->default(0.70);
            $table->timestamps();
        });
        
        // Create default configuration
        DB::table('ai_configurations')->insert([
            'system_prompt' => 'You are a helpful support assistant for MDM SEVA, a school meal management system. Assist users with questions about daily consumption tracking, rice reports, amount reports, bill generation, and system usage. Be professional, concise, and helpful.',
            'is_enabled' => true,
            'auto_respond' => true,
            'max_tokens' => 1024,
            'temperature' => 0.70,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_configurations');
    }
};
