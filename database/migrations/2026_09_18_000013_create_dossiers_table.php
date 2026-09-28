<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dossiers', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique(); // DOS-2026-XXXXX
            $table->string('type', 50);
            $table->string('status', 50)->default('draft');
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->foreignId('client2_id')->nullable()->constrained('clients')->onDelete('set null');
            $table->foreignId('adoul_id')->nullable()->constrained('users')->onDelete('set null');
            $table->decimal('amount_due', 10, 2)->default(0);
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->text('notes_ar')->nullable();
            $table->text('notes_fr')->nullable();
            $table->date('act_date')->nullable();
            $table->date('signing_date')->nullable();
            $table->date('qadi_validation_date')->nullable();
            $table->string('qadi_reference')->nullable();
            $table->json('details')->nullable(); // contract specific: witnesses, mahr, property specifics, poa clauses
            $table->json('documents')->nullable(); // array of uploaded file paths
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dossiers');
    }
};
