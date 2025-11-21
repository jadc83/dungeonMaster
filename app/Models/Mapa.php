<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mapa extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'imagen_url',
        'spawn_x',
        'spawn_y',
        'salidas',
        'grid_size_px',
        'niebla_de_guerra',
        'notas_master',
        'musica_url',
    ];

    // Indica a Laravel que estos campos deben tratarse como arrays/JSON
    protected $casts = [
        'salidas' => 'array',
        'niebla_de_guerra' => 'array',
    ];
}
