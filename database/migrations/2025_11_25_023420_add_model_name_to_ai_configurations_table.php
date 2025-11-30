<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ai_configurations', function (Blueprint $table) {
            $table->string('model_name')->default('gemini-2.5-flash')->after('auto_respond');
        });
        
        // Update any existing records to use the correct model
        DB::table('ai_configurations')->update([
            'model_name' => 'gemini-2.5-flash',
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ai_configurations', function (Blueprint $table) {
            $table->dropColumn('model_name');
        });
    }
};
