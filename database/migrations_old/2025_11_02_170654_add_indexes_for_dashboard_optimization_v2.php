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
        // Add indexes to daily_consumptions table
        Schema::table('daily_consumptions', function (Blueprint $table) {
            $this->addIndexIfNotExists('daily_consumptions', 'user_id', $table);
            $this->addIndexIfNotExists('daily_consumptions', 'date', $table);
            $this->addIndexIfNotExists('daily_consumptions', 'created_at', $table);
            $this->addIndexIfNotExists('daily_consumptions', ['user_id', 'date'], $table);
        });

        // Add indexes to rice_configurations table
        Schema::table('rice_configurations', function (Blueprint $table) {
            $this->addIndexIfNotExists('rice_configurations', 'user_id', $table);
            $this->addIndexIfNotExists('rice_configurations', 'school_type', $table);
        });

        // Add indexes to amount_configurations table
        Schema::table('amount_configurations', function (Blueprint $table) {
            $this->addIndexIfNotExists('amount_configurations', 'user_id', $table);
            $this->addIndexIfNotExists('amount_configurations', 'year', $table);
            $this->addIndexIfNotExists('amount_configurations', 'month', $table);
            $this->addIndexIfNotExists('amount_configurations', ['year', 'month'], $table);
            $this->addIndexIfNotExists('amount_configurations', ['user_id', 'year', 'month'], $table);
        });
    }

    /**
     * Add index if it doesn't already exist
     */
    private function addIndexIfNotExists(string $tableName, string|array $columns, Blueprint $table): void
    {
        $indexName = $this->generateIndexName($tableName, $columns);
        
        if (!$this->indexExists($tableName, $indexName)) {
            $table->index($columns);
        }
    }

    /**
     * Generate index name following Laravel's convention
     */
    private function generateIndexName(string $tableName, string|array $columns): string
    {
        $columnStr = is_array($columns) ? implode('_', $columns) : $columns;
        return "{$tableName}_{$columnStr}_index";
    }

    /**
     * Check if an index exists in the database
     */
    private function indexExists(string $table, string $indexName): bool
    {
        $connection = Schema::getConnection();
        $database = $connection->getDatabaseName();
        
        $result = DB::select(
            "SELECT COUNT(*) as count 
             FROM information_schema.statistics 
             WHERE table_schema = ? 
             AND table_name = ? 
             AND index_name = ?",
            [$database, $table, $indexName]
        );
        
        return $result[0]->count > 0;
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('daily_consumptions', function (Blueprint $table) {
            $this->dropIndexIfExists('daily_consumptions', ['user_id'], $table);
            $this->dropIndexIfExists('daily_consumptions', ['date'], $table);
            $this->dropIndexIfExists('daily_consumptions', ['created_at'], $table);
            $this->dropIndexIfExists('daily_consumptions', ['user_id', 'date'], $table);
        });

        Schema::table('rice_configurations', function (Blueprint $table) {
            $this->dropIndexIfExists('rice_configurations', ['user_id'], $table);
            $this->dropIndexIfExists('rice_configurations', ['school_type'], $table);
        });

        Schema::table('amount_configurations', function (Blueprint $table) {
            $this->dropIndexIfExists('amount_configurations', ['user_id'], $table);
            $this->dropIndexIfExists('amount_configurations', ['year'], $table);
            $this->dropIndexIfExists('amount_configurations', ['month'], $table);
            $this->dropIndexIfExists('amount_configurations', ['year', 'month'], $table);
            $this->dropIndexIfExists('amount_configurations', ['user_id', 'year', 'month'], $table);
        });
    }

    /**
     * Drop index if it exists
     */
    private function dropIndexIfExists(string $tableName, array $columns, Blueprint $table): void
    {
        $indexName = $this->generateIndexName($tableName, $columns);
        
        if ($this->indexExists($tableName, $indexName)) {
            $table->dropIndex($columns);
        }
    }
};