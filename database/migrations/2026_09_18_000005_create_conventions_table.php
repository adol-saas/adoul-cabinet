<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conventions', function (Blueprint $table) {
            $table->id();
            $table->string('title_ar');
            $table->string('title_fr');
            $table->text('description_ar')->nullable();
            $table->text('description_fr')->nullable();
            $table->string('file_path');
            $table->string('category')->default('ministry'); // ministry, court, order
            $table->string('reference_number')->nullable();
            $table->date('issued_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conventions');
    }
};
