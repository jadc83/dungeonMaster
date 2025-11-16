<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePersonajeRequest;
use App\Http\Requests\UpdatePersonajeRequest;
use App\Models\Personaje;
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
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
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
     */
    public function show(Personaje $personaje)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Personaje $personaje)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
public function update(Request $request, Personaje $personaje)
    {
        // Validamos CUALQUIER campo que venga en la petición,
        // basándonos en las reglas de la migración.
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
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Personaje $personaje)
    {
        //
    }
}
