<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Personaje extends Model
{
    /** @use HasFactory<\Database\Factories\PersonajeFactory> */
    use HasFactory;

       protected $fillable = [
        'nombre',
        'nacionalidad',
        'residencia',
        'profesion',
        'edad',
        'genero',
        'nombre_jugador',
        'fuerza',
        'constitucion',
        'destreza',
        'inteligencia',
        'apariencia',
        'tamano',
        'poder',
        'educacion',
        'cordura',
        'locura_temporal',
        'locura_indefinida',
        'pos_x',
        'pos_y',
    ];
}
