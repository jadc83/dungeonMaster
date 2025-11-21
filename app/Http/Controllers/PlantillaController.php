<?php

namespace App\Http\Controllers;

use App\Models\Evento;
use App\Models\Objeto; // Asegúrate de importar tu modelo
use Illuminate\Http\Request;

class PlantillaController extends Controller
{
    /**
     * Obtiene la lista de todos los objetos para usarlos como plantillas.
     */
    public function getObjetos()
    {
        // Selecciona solo columnas existentes en la DB
        $objetos = Objeto::select(['id', 'denominacion', 'valor'])->get();

        // Mapeamos para el frontend, añadiendo el valor que React espera
        return response()->json($objetos->map(function ($objeto) {
            return [
                'id' => $objeto->id,
                'denominacion' => $objeto->denominacion,
                'valor' => $objeto->valor, // <-- Añadido para el frontend
                'type' => 'object', // TIPO DE ELEMENTO: 'object'
                'icon_url' => '✨', // Valor por defecto
            ];
        }));
    }

    /**
     * Obtiene la lista de todos los eventos para usarlos como plantillas.
     */
    public function getEventos()
    {
        // Selecciona el campo correcto según el modelo y migración
        $eventos = Evento::select(['id', 'nombre', 'icono_url'])->get();

        // Mapea los datos para asegurar que el frontend recibe lo que espera
        return response()->json($eventos->map(function ($e) {
            return [
                'id' => $e->id,
                'nombre' => $e->nombre,
                'icon_url' => $e->icono_url ?: '🚨', // Consistencia con el modelo
                'type' => 'evento', // <-- CORREGIDO: TIPO DE ELEMENTO: 'evento'
            ];
        }));
    }

    // Puedes añadir más métodos aquí para otras plantillas (Armas, Hechizos, etc.)
}
