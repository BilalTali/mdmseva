<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('feedback', function (Blueprint $table) {
            $table->string('udise_code', 20)->nullable()->after('school_name');
            $table->string('state', 120)->nullable()->after('udise_code');
            $table->string('district', 120)->nullable()->after('state');
            $table->string('zone', 120)->nullable()->after('district');
        });
    }

    public function down(): void
    {
        Schema::table('feedback', function (Blueprint $table) {
            $table->dropColumn(['udise_code', 'state', 'district', 'zone']);
        });
    }
};
