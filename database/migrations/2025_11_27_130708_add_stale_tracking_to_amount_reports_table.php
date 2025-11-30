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
        Schema::table('amount_reports', function (Blueprint $table) {
            $table->boolean('is_stale')->default(false)->after('daily_records');
            $table->text('stale_reason')->nullable()->after('is_stale');
            $table->timestamp('stale_since')->nullable()->after('stale_reason');
            $table->foreignId('depends_on_rice_report_id')->nullable()->after('stale_since')->constrained('rice_reports')->nullOnDelete();
            $table->string('source_daily_hash')->nullable()->after('depends_on_rice_report_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('amount_reports', function (Blueprint $table) {
            $table->dropForeign(['depends_on_rice_report_id']);
            $table->dropColumn([
                'is_stale',
                'stale_reason',
                'stale_since',
                'depends_on_rice_report_id',
                'source_daily_hash'
            ]);
        });
    }
};
