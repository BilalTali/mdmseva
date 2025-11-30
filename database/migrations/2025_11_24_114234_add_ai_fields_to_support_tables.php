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
        Schema::table('support_chats', function (Blueprint $table) {
            $table->boolean('ai_enabled')->default(true)->after('last_message_at');
            $table->timestamp('last_human_admin_at')->nullable()->after('ai_enabled');
        });
        
        Schema::table('support_messages', function (Blueprint $table) {
            $table->boolean('is_ai_generated')->default(false)->after('is_admin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('support_chats', function (Blueprint $table) {
            $table->dropColumn(['ai_enabled', 'last_human_admin_at']);
        });
        
        Schema::table('support_messages', function (Blueprint $table) {
            $table->dropColumn('is_ai_generated');
        });
    }
};
