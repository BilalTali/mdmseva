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
        Schema::table('rice_reports', function (Blueprint $table) {
            $table->boolean('is_stale')->default(false)->after('daily_records');
            $table->text('stale_reason')->nullable()->after('is_stale');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rice_reports', function (Blueprint $table) {
            $table->dropColumn(['is_stale', 'stale_reason']);
        });
    }
};
