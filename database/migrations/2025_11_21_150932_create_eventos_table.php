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
        Schema::create('eventos', function (Blueprint $table) {
            $table->id();

            // Nombre de la plantilla (ej: "Emboscada de Goblins", "Puerta con Acertijo")
            $table->string('nombre')->unique();

            // Descripción detallada de lo que hace (para el Master)
            $table->text('descripcion_master');

            // Texto/Diálogo que ve el jugador al activarse (opcional, si no es combate)
            $table->text('texto_jugador')->nullable();

            // Tipo de evento (para lógica en el frontend: 'combate', 'narrativa', 'trampa')
            $table->enum('tipo_accion', ['combate', 'narrativo', 'trampa', 'encuentro', 'descubrir']);

            // Opcional: Ruta de un icono por defecto
            $table->string('icono_url')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('eventos');
    }
};
