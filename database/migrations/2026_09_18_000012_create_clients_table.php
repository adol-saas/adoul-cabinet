<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('cin')->index(); // Moroccan CIN e.g. AB123456
            $table->string('name_ar');
            $table->string('name_fr');
            $table->string('name_ber')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('birth_city')->nullable();
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->enum('gender', ['male', 'female'])->default('male');
            $table->enum('marital_status', ['single', 'married', 'divorced', 'widowed'])->default('single');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
