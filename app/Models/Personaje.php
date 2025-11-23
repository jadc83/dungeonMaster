<?php

// app/Models/Personaje.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// Importar la clase de relación
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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
        'avatar_url',
        'cordura_maxima',
        'hp',
        'mp',
    ];

    /**
     * Define la relación de muchos a muchos con los objetos en el inventario.
     *
     * @return BelongsToMany
     */
    public function inventario(): BelongsToMany // ⬅️ CORREGIDO: Tipo de retorno y sintaxis
    {
        return $this->belongsToMany(Objeto::class, 'objeto_personaje', 'personaje_id', 'objeto_id')
                    ->withPivot('cantidad', 'equipado')
                    ->withTimestamps();
    } // ⬅️ CORREGIDO: El punto y coma final (;) eliminado
}
