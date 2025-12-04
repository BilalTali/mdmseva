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
        Schema::table('roll_statements', function (Blueprint $table) {
            $table->timestamp('last_updated_at')->nullable()->after('total');
            $table->foreignId('updated_by')->nullable()->after('last_updated_at')->constrained('users')->nullOnDelete();
        });

        // Initialize last_updated_at for existing records
        DB::table('roll_statements')->update([
            'last_updated_at' => DB::raw('updated_at')
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('roll_statements', function (Blueprint $table) {
            $table->dropForeign(['updated_by']);
            $table->dropColumn(['last_updated_at', 'updated_by']);
        });
    }
};
