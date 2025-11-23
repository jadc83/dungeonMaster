<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ObjetoPersonaje extends Model
{
    /** @use HasFactory<\Database\Factories\ObjetoPersonajeFactory> */
    use HasFactory;

    protected $table = 'objeto_personaje';
    protected $fillable = [
        'personaje_id',
        'objeto_id',
        'cantidad',
        'equipado',
    ];
}
