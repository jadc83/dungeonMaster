<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// 💡 Necesitas importar la clase de relación
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Objeto extends Model
{
    use HasFactory;
    protected $table = 'objetos';
    protected $fillable = [
        'denominacion',
        'descripcion',
        'valor',
    ];

    public function instanciasEnMapa()
    {
        return $this->morphMany(ElementoMapa::class, 'elementable');
    }

    /**
     * Define la relación de muchos a muchos con los personajes que poseen este objeto.
     * Incluye los campos 'cantidad' y 'equipado' de la tabla pivot.
     *
     * @return BelongsToMany
     */
    public function poseedores(): BelongsToMany // ⬅️ CORREGIDO: Añadido el tipo de retorno
    {
        return $this->belongsToMany(Personaje::class, 'personaje_objeto', 'objeto_id', 'personaje_id')
                    ->withPivot('cantidad', 'equipado')
                    ->withTimestamps();
    }
}
