<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Only add indexes if columns exist and indexes don't already exist
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'udise') && !$this->indexExists('users', 'users_udise_index')) {
                $table->index('udise', 'users_udise_index');
            }
            if (Schema::hasColumn('users', 'district_id') && !$this->indexExists('users', 'users_district_id_index')) {
                $table->index('district_id', 'users_district_id_index');
            }
            if (Schema::hasColumn('users', 'zone_id') && !$this->indexExists('users', 'users_zone_id_index')) {
                $table->index('zone_id', 'users_zone_id_index');
            }
            if (Schema::hasColumn('users', 'phone') && !$this->indexExists('users', 'users_phone_index')) {
                $table->index('phone', 'users_phone_index');
            }
            if (Schema::hasColumns('users', ['district_id', 'zone_id']) && !$this->indexExists('users', 'users_district_zone_index')) {
                $table->index(['district_id', 'zone_id'], 'users_district_zone_index');
            }
            if (Schema::hasColumns('users', ['district_id', 'udise']) && !$this->indexExists('users', 'users_district_udise_index')) {
                $table->index(['district_id', 'udise'], 'users_district_udise_index');
            }
        });

        if (Schema::hasTable('districts')) {
            Schema::table('districts', function (Blueprint $table) {
                if (Schema::hasColumn('districts', 'name') && !$this->indexExists('districts', 'districts_name_index')) {
                    $table->index('name', 'districts_name_index');
                }
            });
        }

        if (Schema::hasTable('zones')) {
            Schema::table('zones', function (Blueprint $table) {
                if (Schema::hasColumn('zones', 'district_id') && !$this->indexExists('zones', 'zones_district_id_index')) {
                    $table->index('district_id', 'zones_district_id_index');
                }
                if (Schema::hasColumn('zones', 'name') && !$this->indexExists('zones', 'zones_name_index')) {
                    $table->index('name', 'zones_name_index');
                }
            });
        }
    }

    /**
     * Check if an index exists on a table
     */
    private function indexExists(string $table, string $index): bool
    {
        $connection = Schema::getConnection();
        $databaseName = $connection->getDatabaseName();
        
        $result = $connection->select(
            "SELECT COUNT(*) as count FROM information_schema.statistics 
             WHERE table_schema = ? AND table_name = ? AND index_name = ?",
            [$databaseName, $table, $index]
        );
        
        return $result[0]->count > 0;
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_udise_index');
            $table->dropIndex('users_district_id_index');
            $table->dropIndex('users_zone_id_index');
            $table->dropIndex('users_phone_index');
            $table->dropIndex('users_district_zone_index');
            $table->dropIndex('users_district_udise_index');
        });

        Schema::table('districts', function (Blueprint $table) {
            $table->dropIndex('districts_name_index');
        });

        Schema::table('zones', function (Blueprint $table) {
            $table->dropIndex('zones_district_id_index');
            $table->dropIndex('zones_name_index');
        });
    }
};
