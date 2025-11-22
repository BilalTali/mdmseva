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
        // Add indexes for rice_reports table if it exists
        if (Schema::hasTable('rice_reports')) {
            Schema::table('rice_reports', function (Blueprint $table) {
                if (!$this->indexExists('rice_reports', 'rice_reports_user_id_index')) {
                    $table->index('user_id');
                }
                if (!$this->indexExists('rice_reports', 'rice_reports_year_month_index')) {
                    $table->index(['year', 'month']);
                }
            });
        }

        // Add indexes for amount_reports table if it exists
        if (Schema::hasTable('amount_reports')) {
            Schema::table('amount_reports', function (Blueprint $table) {
                if (!$this->indexExists('amount_reports', 'amount_reports_user_id_index')) {
                    $table->index('user_id');
                }
                if (!$this->indexExists('amount_reports', 'amount_reports_year_month_index')) {
                    $table->index(['year', 'month']);
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes if they exist
        if (Schema::hasTable('amount_reports')) {
            Schema::table('amount_reports', function (Blueprint $table) {
                if ($this->indexExists('amount_reports', 'amount_reports_user_id_index')) {
                    $table->dropIndex(['user_id']);
                }
                if ($this->indexExists('amount_reports', 'amount_reports_year_month_index')) {
                    $table->dropIndex(['year', 'month']);
                }
            });
        }

        if (Schema::hasTable('rice_reports')) {
            Schema::table('rice_reports', function (Blueprint $table) {
                if ($this->indexExists('rice_reports', 'rice_reports_user_id_index')) {
                    $table->dropIndex(['user_id']);
                }
                if ($this->indexExists('rice_reports', 'rice_reports_year_month_index')) {
                    $table->dropIndex(['year', 'month']);
                }
            });
        }
    }

    /**
     * Check if an index exists
     */
    private function indexExists($table, $indexName)
    {
        try {
            $indexes = \DB::select("SHOW INDEX FROM {$table} WHERE Key_name = ?", [$indexName]);
            return !empty($indexes);
        } catch (\Exception $e) {
            return false;
        }
    }
};