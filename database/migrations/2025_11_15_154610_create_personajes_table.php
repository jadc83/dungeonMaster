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
        Schema::create('personajes', function (Blueprint $table) {
            $table->id();

            // --- Información Básica (de texto) ---
            $table->string('nombre')->unique();
            $table->string('nacionalidad')->default('Desconocida');
            $table->string('residencia')->default('Desconocida');
            $table->string('profesion')->default('Investigador');
            $table->integer('edad')->default(30);
            $table->string('genero')->default('No especificado');
            $table->string('nombre_jugador')->nullable(); // Puede ser nulo

            // --- Atributos de Cthulhu (Valores por defecto 50, Posición 0) ---
            $table->integer('fuerza')->default(50);
            $table->integer('constitucion')->default(50);
            $table->integer('destreza')->default(50);
            $table->integer('inteligencia')->default(50);
            $table->integer('apariencia')->default(50);
            $table->integer('tamano')->default(50);
            $table->integer('poder')->default(50);
            $table->integer('educacion')->default(50);

            // --- Locura y Estado ---
            $table->integer('cordura')->default(50); // Valor inicial
            $table->boolean('locura_temporal')->default(false);
            $table->boolean('locura_indefinida')->default(false);

            // --- Posicionamiento en el Mapa (Necesario para React Draggable) ---
            $table->integer('pos_x')->default(0);
            $table->integer('pos_y')->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personajes');
    }
};
