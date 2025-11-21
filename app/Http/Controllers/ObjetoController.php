<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreObjetoRequest;
use App\Http\Requests\UpdateObjetoRequest;
use App\Models\Objeto;

class ObjetoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $objetos = Objeto::all();
        return view('objetos.index', compact('objetos'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('objetos.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreObjetoRequest $request)
    {
        $objeto = Objeto::create($request->validated());
        return redirect()->route('objetos.show', $objeto)->with('success', 'Objeto creado correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Objeto $objeto)
    {
        return view('objetos.show', compact('objeto'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Objeto $objeto)
    {
        return view('objetos.edit', compact('objeto'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateObjetoRequest $request, Objeto $objeto)
    {
        $objeto->update($request->validated());
        return redirect()->route('objetos.show', $objeto)->with('success', 'Objeto actualizado correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Objeto $objeto)
    {
        $objeto->delete();
        return redirect()->route('objetos.index')->with('success', 'Objeto eliminado correctamente.');
    }
}
