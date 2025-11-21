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
Schema::create('mapa_posicion', function (Blueprint $table) {
        $table->id();
        $table->foreignId('personaje_id')->constrained();
        $table->foreignId('mapa_id')->constrained();
        $table->integer('pos_x');
        $table->integer('pos_y');
        $table->timestamps();
        $table->unique(['personaje_id', 'mapa_id']);
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mapa_posicion');
    }
};
