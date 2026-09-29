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
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar_path')->nullable()->after('job_title');
            $table->string('signature_path')->nullable()->after('avatar_path');
            $table->string('cin', 30)->nullable()->after('signature_path');
            $table->string('license_number', 100)->nullable()->after('cin');
            $table->text('bio')->nullable()->after('license_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'avatar_path',
                'signature_path',
                'cin',
                'license_number',
                'bio',
            ]);
        });
    }
};
