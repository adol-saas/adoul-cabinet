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
        Schema::table('office_settings', function (Blueprint $table) {
            $table->string('adoul_name')->nullable()->after('office_name_fr');
            $table->string('second_adoul_name')->nullable()->after('adoul_name');
            $table->string('court_name')->nullable()->after('qadi_name');
            $table->string('license_number')->nullable()->after('court_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('office_settings', function (Blueprint $table) {
            $table->dropColumn(['adoul_name', 'second_adoul_name', 'court_name', 'license_number']);
        });
    }
};
