<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ElementoMapa extends Model
{
    /** @use HasFactory<\Database\Factories\ElementoMapaFactory> */
    use HasFactory;
    protected $table = 'elementos_mapa';
protected $fillable = [
    'mapa_id',          // Clave foránea al Mapa
    'elementable_id',   // ID del objeto/evento (parte polimórfica)
    'elementable_type', // Tipo del modelo (parte polimórfica)
    'pos_x',            // Posición X
    'pos_y',            // Posición Y
    'rango_activacion', // Rango de activación
    'esta_activo',      // Estado (booleano)
    // No olvides que Laravel maneja 'created_at' y 'updated_at' automáticamente
];
    public function mapa()
    {
        return $this->belongsTo(Mapa::class, 'mapa_id');
    }

    /**
     * Relación Polimórfica: Obtiene el modelo padre (Objeto o Evento).
     */
    public function elementable()
    {
        return $this->morphTo();
    }
}
