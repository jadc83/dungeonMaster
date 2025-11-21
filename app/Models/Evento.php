<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evento extends Model
{
    /** @use HasFactory<\Database\Factories\EventoFactory> */
    use HasFactory;
    protected $table = 'eventos';

    // 2. Campos que pueden ser asignados masivamente
    protected $fillable = [
        'nombre',
        'descripcion_master',
        'texto_jugador',
        'tipo_accion',
        'icono_url',
    ];

    public function instanciasEnMapa()
    {
        return $this->morphMany(ElementoMapa::class, 'elementable');
    }
}
