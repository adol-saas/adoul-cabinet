<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_templates', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // marriage, divorce, revocation, property_sale, poa, will, etc.
            $table->string('name_ar');
            $table->string('name_fr');
            $table->longText('content_ar');
            $table->longText('content_fr');
            $table->longText('content_ber')->nullable();
            $table->json('variables')->nullable(); // list of placeholders e.g. {{client_name}}
            $table->boolean('is_active')->default(true);
            $table->integer('version')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_templates');
    }
};
