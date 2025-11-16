<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePersonajeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
public function rules(): array
{
    return [
        'nombre' => 'required|string|max:255|unique:personajes,nombre',
        'nacionalidad' => 'required|string|max:255',
        'residencia' => 'required|string|max:255',
        'profesion' => 'required|string|max:255',
        'edad' => 'required|integer|min:0|max:150',
        'genero' => 'required|string|max:255',
        'nombre_jugador' => 'nullable|string|max:255',

        'fuerza' => 'nullable|integer|min:0|max:100',
        'constitucion' => 'nullable|integer|min:0|max:100',
        'destreza' => 'nullable|integer|min:0|max:100',
        'inteligencia' => 'nullable|integer|min:0|max:100',
        'apariencia' => 'nullable|integer|min:0|max:100',
        'tamano' => 'nullable|integer|min:0|max:100',
        'poder' => 'nullable|integer|min:0|max:100',
        'educacion' => 'nullable|integer|min:0|max:100',

        'cordura' => 'nullable|integer|min:0|max:100',
        'locura_temporal' => 'nullable|boolean',
        'locura_indefinida' => 'nullable|boolean',

        'pos_x' => 'nullable|integer',
        'pos_y' => 'nullable|integer',
    ];
}
}
