<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('objeto_personaje', function (Blueprint $table) {
            // 1. CLAVE PRIMARIA ÚNICA (NO COMPUESTA)
            // Esto permite que un mismo personaje tenga múltiples filas
            // para el mismo objeto (ej. para diferentes stacks, o simplemente
            // para permitir gestionar la cantidad en una sola fila).
            $table->id();
            // 3. CAMPO DE CANTIDAD (CRUCIAL para flechas, pociones, etc.)
            $table->integer('cantidad')->default(1)->comment('Cantidad de este objeto en esta ranura de inventario.');

            // 4. CAMPO OPCIONAL DE ESTADO
            $table->boolean('equipado')->default(false)->comment('Indica si el objeto está siendo usado activamente (p. ej., arma o armadura).');

            // 5. DEFINICIÓN DE LAS CLAVES FORÁNEAS
            $table->foreignId('personaje_id')->constrained('personajes');
            $table->foreignId('objeto_id')->constrained('objetos');

            // 6. ÍNDICE DE EFICIENCIA
            // Aunque la PK ya no es compuesta, este índice ayuda a buscar el inventario del personaje rápidamente.
            $table->index(['personaje_id', 'objeto_id']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('objeto_personaje');
    }
};
