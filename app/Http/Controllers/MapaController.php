<?php

namespace App\Http\Controllers;

use App\Models\Mapa;
use App\Models\ElementoMapa;
use App\Models\Objeto;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log; // Importar la clase Log para manejar errores
use Illuminate\Database\QueryException; // Para manejar errores de BD

// --- ¡IMPORTS PARA INTERVENTION IMAGE V3! ---
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class MapaController extends Controller
{
    // Tamaño máximo (en píxeles) para el lado más largo del mapa
    const MAX_MAP_DIMENSION = 2048;
    // Definición de la carpeta de destino
    const MAP_STORAGE_PATH = 'mapas';

    public function index()
    {
        // 1. Cargamos todos los mapas
        $maps = Mapa::all();

        // 2. Aseguramos que la URL sea correcta (usando asset() como fallback si Storage::url falla)
        $maps->each(function ($map) {
            // Verificar si la URL ya apunta a /storage o si es la ruta relativa interna
            if (!str_starts_with($map->imagen_url, 'http') && !str_starts_with($map->imagen_url, '/storage')) {
                // Si la URL guardada es solo 'mapas/archivo.webp', la convertimos a URL pública accesible:
                $map->imagen_url = asset('storage/' . $map->imagen_url);
            }
        });

        return response()->json($maps);
    }

    /**
     * Guarda un nuevo mapa (con redimensionado usando Intervention V3).
     */
    public function store(Request $request)
    {
        // 1. Validación (Max 10MB)
        $validatedData = $request->validate([
            'nombre' => 'required|string|max:255',
            'map_file' => 'required|image|mimes:jpeg,png,jpg,webp|max:10240', // 10 MB = 10240 KB
        ]);

        $file = $request->file('map_file');
        // Usamos webp como formato de salida optimizado
        $filename = 'map-' . time() . '-' . uniqid() . '.webp';
        $path = self::MAP_STORAGE_PATH . '/' . $filename; // mapas/map-....webp

        try {
            // 2. Procesar y Redimensionar la Imagen (Intervention Image V3)
            $manager = new ImageManager(new Driver());
            $image = $manager->read($file->getRealPath());

            // Redimensiona la imagen para que encaje en el MAX_DIMENSION (2048px)
            $image->scaleDown(width: self::MAX_MAP_DIMENSION, height: self::MAX_MAP_DIMENSION);

            // 3. Guarda la imagen procesada al disco (como WEBP, calidad 90)
            // --- ¡CORRECCIÓN! Usar toWebp(quality) en lugar de encode('webp', quality) en Intervention V3
            $imageContent = $image->toWebp(90);

            // 4. Intenta guardar el archivo en storage/app/public/mapas
            $success = Storage::disk('public')->put($path, $imageContent);

            if (!$success) {
                // Falla el guardado por disco.
                Log::error('Fallo al guardar el archivo en disco (Storage::put): Permisos o espacio.', ['path' => $path]);
                return response()->json([
                    'message' => 'Hubo un error al guardar el archivo en el disco. Verifique permisos.',
                    'error_code' => 'STORAGE_FAIL'
                ], 500);
            }

            // 5. Crea el registro en la BD
            $mapa = Mapa::create([
                'nombre' => $validatedData['nombre'],
                // Guardamos la URL generada por Laravel.
                'imagen_url' => Storage::url($path),
                'spawn_x' => 0,
                'spawn_y' => 0,
                'grid_size_px' => 50, // Valor por defecto
            ]);

            // 6. Devolver el objeto Mapa como JSON
            return response()->json($mapa, 201);

        } catch (QueryException $e) {
            // Error específico de la base de datos
            Log::error('Error de base de datos al crear el mapa: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error de base de datos al crear el mapa. Campos faltantes o incorrectos.',
                'error_code' => 'DB_FAIL'
            ], 500);
        }
        catch (\Exception $e) {
            // Cualquier otro error (ej. Intervention, validación, etc.)
            Log::error('Error inesperado al subir el mapa: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            // Mensaje genérico para el usuario, log más detallado para el desarrollador.
            return response()->json([
                'message' => 'Fallo la subida del mapa. (' . $e->getMessage() . ')',
                'error_code' => 'UNKNOWN_FAIL'
            ], 500);
        }
    }

    /**
     * Obtiene los elementos (objetos, eventos) asociados a un mapa.
     * Llama a: GET /mapas/{mapaId}/elementos
     */
    public function getElementos($mapaId)
    {
        // Validar que el ID es válido
        if (!is_numeric($mapaId) || (int)$mapaId <= 0) {
            return response()->json(['message' => 'ID de mapa inválido.'], 400);
        }

        // Obtener todos los ElementosMapa para este ID y CARGAR LA RELACIÓN POLIMÓRFICA
        $elementos = ElementoMapa::where('mapa_id', $mapaId)
            ->with('elementable') // <--- ¡CARGA IMPRESCINDIBLE PARA EL TOOLTIP!
            ->get();

        return response()->json($elementos);
    }

    /**
     * Guarda las instancias de elementos en el mapa.
     */
    public function guardarElementos(Request $request, $mapaId)
    {
        $request->validate([
            'elements' => 'required|array',
        ]);

        // --- VALIDACIÓN DE $mapaId (para proteger la DB) ---
        if (!is_numeric($mapaId) || (int)$mapaId <= 0) {
            Log::error("Intento de guardar elementos con ID de mapa inválido.", ['mapaId' => $mapaId]);
            return response()->json([
                'success' => false,
                'message' => 'El ID del mapa proporcionado es inválido. El mapa no se ha guardado correctamente o la URL es errónea.',
                'error_code' => 'INVALID_MAP_ID'
            ], 400);
        }

        $mapaId = (int) $mapaId; // Castear a entero para usarlo en la inserción

        // Mapeo de tipos de frontend a clases de modelo de Laravel (Polimorfismo)
        $modelMap = [
            'object' => Objeto::class,
            'evento' => Evento::class,
            // Añadir aquí más tipos (Arma, Hechizo) si se agregan en PlantillaController
        ];

        try {
            // Se asume que los Elementos anteriores serán eliminados o gestionados por una lógica superior.

            foreach ($request->input('elements') as $elemento) {
                $elementType = strtolower($elemento['type'] ?? '');

                // 1. Obtener la clase del modelo.
                $modelClass = $modelMap[$elementType] ?? null;

                if (is_null($modelClass)) {
                    Log::warning("Elemento de mapa con tipo no reconocido: " . $elementType, $elemento);
                    continue;
                }

                // --- Castear elementable_id a ENTERO (para bigint) ---
                $elementableId = (int) ($elemento['id'] ?? 0);
                if ($elementableId <= 0) {
                    Log::warning("Elemento de mapa con ID de plantilla inválido (<= 0).", $elemento);
                    continue;
                }

                // 2. Guardar cada elemento en la tabla elementos_mapa
                ElementoMapa::create([
                    'mapa_id' => $mapaId,
                    'elementable_id' => $elementableId, // Usamos el ID casteado a entero
                    'elementable_type' => $modelClass,
                    'pos_x' => $elemento['pos_x'] ?? 0,
                    'pos_y' => $elemento['pos_y'] ?? 0,
                    'rango_activacion' => $elemento['rango_activacion'] ?? 1,
                    'esta_activo' => true,
                ]);
            }
        } catch (\Exception $e) {
            Log::error("Error al guardar elementos del mapa: " . $e->getMessage(), ['mapaId' => $mapaId]);
             return response()->json([
                'success' => false,
                'message' => 'Fallo al procesar o guardar los elementos del mapa.',
                'error_code' => 'ELEMENT_SAVE_FAIL'
             ], 500);
        }

        return response()->json(['success' => true, 'message' => 'Elementos guardados correctamente.']);
    }

    /**
     * Añade un elemento individual al mapa.
     * Se usa cuando se arrastra un objeto desde el panel al mapa.
     */
    public function agregarElemento(Request $request, Mapa $mapa)
    {
        $validated = $request->validate([
            'elementable_type' => 'required|string|in:App\Models\Objeto,App\Models\Evento',
            'elementable_id' => 'required|integer',
            'pos_x' => 'required|integer',
            'pos_y' => 'required|integer',
            'rango_activacion' => 'nullable|integer|min:1'
        ]);

        try {
            $elemento = ElementoMapa::create([
                'mapa_id' => $mapa->id,
                'elementable_type' => $validated['elementable_type'],
                'elementable_id' => $validated['elementable_id'],
                'pos_x' => $validated['pos_x'],
                'pos_y' => $validated['pos_y'],
                'rango_activacion' => $validated['rango_activacion'] ?? 1,
                'esta_activo' => true
            ]);

            // Cargar la relación para devolver el objeto completo
            $elemento->load('elementable');

            return response()->json([
                'success' => true,
                'message' => 'Elemento añadido correctamente.',
                'elemento' => $elemento
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error al añadir elemento al mapa: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al añadir elemento al mapa.'
            ], 500);
        }
    }

    /**
     * Elimina un elemento específico del mapa.
     * Se usa cuando un personaje recoge un objeto del mapa.
     */
    public function eliminarElemento(ElementoMapa $elementoMapa)
    {
        try {
            $elementoMapa->delete();
            return response()->json(['success' => true, 'message' => 'Elemento eliminado correctamente.']);
        } catch (\Exception $e) {
            Log::error('Error al eliminar elemento del mapa: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar elemento del mapa.'
            ], 500);
        }
    }
}
