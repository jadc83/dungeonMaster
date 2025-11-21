<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
}
