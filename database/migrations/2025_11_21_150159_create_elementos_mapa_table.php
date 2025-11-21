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
        Schema::create('elementos_mapa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mapa_id')->constrained('mapas');
            $table->morphs('elementable');
            $table->integer('pos_x');
            $table->integer('pos_y');
            $table->unsignedSmallInteger('rango_activacion')->default(1);
            $table->boolean('esta_activo')->default(true);
            $table->timestamps();
            $table->index(['mapa_id', 'elementable_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('elementos_mapa');
    }
};
