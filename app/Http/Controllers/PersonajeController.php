<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePersonajeRequest;
use App\Http\Requests\UpdatePersonajeRequest;
use App\Models\Personaje;
use App\Models\Objeto; // Importamos el modelo Objeto
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PersonajeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Personaje::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePersonajeRequest $request)
    {
        // 1. Valida todos los campos (incluida la imagen)
        $validatedData = $request->validated();

        // 2. Comprueba si se ha subido un archivo 'avatar_url'
        if ($request->hasFile('avatar_url')) {

            // 3. Guarda el archivo en 'storage/app/public/tokens'
            // y obtiene la ruta (ej: "tokens/random_name.png")
            $path = $request->file('avatar_url')->store('tokens', 'public');

            // 4. Sobrescribe 'avatar_url' en los datos validados
            // para guardar la URL pública (ej: "/storage/tokens/random_name.png")
            $validatedData['avatar_url'] = Storage::url($path);

        } else {
            // (Opcional) Si no se sube, asigna el token por defecto
            $validatedData['avatar_url'] = '/token.png';
        }

        // 5. Crea el personaje con todos los datos
        Personaje::create($validatedData);

        // 6. Redirige (Inertia se encarga)
        return redirect()->route('Tablero'); // O la ruta que tengas
    }

    /**
     * Display the specified resource.
     * * Implementación para cargar el inventario si se solicita (Ej: ?include=inventario).
     */
    public function show(Personaje $personaje)
    {
        // El servicio de JS llama a: /personajes/{id}?include=inventario
        if (request()->has('include') && request('include') === 'inventario') {
            $personaje->load('inventario');
        }

        return response()->json($personaje);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Personaje $personaje)
    {
        // Validamos CUALQUIER campo que venga en la petición.
        $validatedData = $request->validate([
            'pos_x' => 'integer',
            'pos_y' => 'integer',
            'hp' => 'integer|min:0', // Permite 0
            'mp' => 'integer|min:0',
            'cordura' => 'integer|min:0',
            // Añade aquí cualquier otro campo que quieras actualizar
        ]);

        $personaje->update($validatedData);

        return response()->json($personaje);
    }

    // --- NUEVO MÉTODO: Manejar la acción de recoger un objeto ---

    /**
     * Añade un objeto al inventario del personaje, manejando la lógica de apilamiento
     * si el objeto ya existe.
     *
     * @param Request $request
     * @param Personaje $personaje
     * @return \Illuminate\Http\JsonResponse
     */
    public function recogerObjeto(Request $request, Personaje $personaje)
    {
        $request->validate([
            'objeto_id' => 'required|exists:objetos,id',
            'cantidad' => 'nullable|integer|min:1',
        ]);

        $objetoId = $request->input('objeto_id');
        $cantidad = $request->input('cantidad', 1);

        // Paso 1: Intentar encontrar la fila pivot existente para este objeto/personaje.
        // Buscamos si el personaje YA tiene una pila de este objeto.
        $inventarioItem = $personaje->inventario()
                                    ->where('objeto_id', $objetoId)
                                    ->first(); // Obtenemos el objeto (incluyendo los datos de la pivot)

        // Paso 2: LÓGICA DE APILAMIENTO
        if ($inventarioItem) {
            // Si el ítem ya existe, incrementamos la cantidad.
            $nuevaCantidad = $inventarioItem->pivot->cantidad + $cantidad;

            // Usamos updateExistingPivot para actualizar solo la fila pivot.
            $personaje->inventario()->updateExistingPivot($objetoId, [
                'cantidad' => $nuevaCantidad
            ]);

            // Recargamos el ítem para devolver el objeto con la cantidad actualizada
            $inventarioItem = $personaje->inventario()->where('objeto_id', $objetoId)->first();
            $mensaje = "Cantidad actualizada a " . $nuevaCantidad;

        } else {
            // Si el ítem no existe, creamos una nueva fila en la tabla pivot.
            $personaje->inventario()->attach($objetoId, [
                'cantidad' => $cantidad,
                'equipado' => false // Por defecto, no equipado
            ]);

            // Recargamos el ítem recién creado para devolverlo en la respuesta
            $inventarioItem = $personaje->inventario()->where('objeto_id', $objetoId)->first();
            $mensaje = "Objeto añadido al inventario.";
        }

        return response()->json([
            'message' => $mensaje,
            'inventario_item' => $inventarioItem,
        ], 200);
    }


    // --- MÉTODOS NO IMPLEMENTADOS (mantener para completar la clase) ---

    public function create()
    {
        //
    }

    public function edit(Personaje $personaje)
    {
        //
    }

    public function destroy(Personaje $personaje)
    {
        //
    }
}
