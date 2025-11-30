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
        Schema::table('developer_messages', function (Blueprint $table) {
            $table->string('name')->after('id');
            $table->string('designation')->after('name');
            $table->string('role')->nullable()->after('designation');
            
            // Rename title to keep backward compatibility, or we can drop it
            // For now, making title nullable since we're using name instead
            $table->string('title')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('developer_messages', function (Blueprint $table) {
            $table->dropColumn(['name', 'designation', 'role']);
            $table->string('title')->nullable(false)->change();
        });
    }
};
