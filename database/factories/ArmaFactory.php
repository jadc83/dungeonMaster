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
        Schema::create('armas', function (Blueprint $table) {
            $table->id();

            // Nombre
            $table->string('nombre', 100);

            // Habilidad
            $table->string('habilidad', 100);

            // Daño
            // VARCHAR o STRING es mejor para valores como "1D10" o "1D6"
            $table->string('dano', 10);

            // Alcance
            // VARCHAR o STRING para valores como "15 m" o "3 m"
            $table->string('alcance', 20);

            // Usos
            // Este campo es un poco ambiguo (1 (3) o 1), lo trataremos como string.
            $table->string('usos', 20);

            // Carg (Capacidad/Cargador)
            $table->unsignedSmallInteger('capacidad');

            // Coste
            // VARCHAR/STRING para almacenar valores con formato como "-/500 $" o "$/55 $"
            $table->string('coste', 50);

            // FD (Fallo de Disparo o similar)
            $table->string('fallo', 20)->nullable();

            // Época
            $table->string('epoca', 50);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('armas');
    }
};
