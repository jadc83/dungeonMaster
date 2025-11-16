<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePersonajeRequest;
use App\Http\Requests\UpdatePersonajeRequest;
use App\Models\Personaje;
use Illuminate\Http\Request;

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
    $validatedData = $request->validated();
    Personaje::create($validatedData);

    // Redirige al tablero. Inertia se encargará del resto.
    return redirect()->route('Tablero'); // O la ruta que tengas para el tablero
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
    $validated = $request->validate([
        'pos_x' => 'required|integer',
        'pos_y' => 'required|integer',
    ]);

    $personaje->update($validated);

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
