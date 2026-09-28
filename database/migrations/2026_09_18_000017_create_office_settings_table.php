<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('office_settings', function (Blueprint $table) {
            $table->id();
            $table->string('office_name_ar');
            $table->string('office_name_fr');
            $table->string('city');
            $table->string('region')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('qadi_name')->nullable();
            $table->string('stamp_image_path')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('hero_image_path')->nullable();
            $table->string('tagline_ar')->nullable();
            $table->string('tagline_fr')->nullable();
            $table->text('bio_ar')->nullable();
            $table->text('bio_fr')->nullable();
            $table->string('color_primary')->default('#0d5f47');
            $table->string('theme_color')->default('emerald');
            $table->text('footer_text_ar')->nullable();
            $table->text('footer_text_fr')->nullable();
            $table->string('whatsapp_number')->nullable();
            $table->json('working_hours')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('office_settings');
    }
};
