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
Schema::create('mapas', function (Blueprint $table) {
        $table->id();
        $table->string('nombre');
        $table->string('imagen_url');
        $table->integer('spawn_x')->default(0);
        $table->integer('spawn_y')->default(0);
        $table->json('salidas')->nullable();
        $table->integer('grid_size_px')->default(50);
        $table->longText('niebla_de_guerra')->nullable();
        $table->text('notas_master')->nullable();
        $table->string('musica_url')->nullable();
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mapas');
    }
};
