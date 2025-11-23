<?php

use App\Http\Controllers\MapaController;
use App\Http\Controllers\PersonajeController;
use App\Http\Controllers\PlantillaController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Rutas protegidas que necesitan autenticación:

    // RUTAS BASE DE PERSONAJES
    Route::get('/personajes', [PersonajeController::class, 'index']);
    Route::patch('/personajes/{personaje}', [PersonajeController::class, 'update']);
    Route::get('/personajes/crear', function () {
        return Inertia::render('CrearPersonaje');
    });
    Route::post('/personajes', [PersonajeController::class, 'store']);

    // RUTAS DE INVENTARIO Y DETALLE (NUEVAS O MODIFICADAS)
    // 1. Obtener detalles del personaje con posibles inclusiones (incluyendo inventario)
    // El servicio JS usa esta ruta con el query param: /personajes/{id}?include=inventario
    Route::get('/personajes/{personaje}', [PersonajeController::class, 'show']);

    // 2. Acción para Recoger/Añadir un Objeto al Inventario (POST)
    // Usado por personajeService.recogerObjeto
    Route::post('/personajes/{personaje}/inventario/recoger', [PersonajeController::class, 'recogerObjeto']);

    // RUTAS DE MAPAS Y EDICIÓN
    Route::get('/tablero', function () {
        return Inertia::render('Tablero');
    })->name('tablero');

    Route::get('/mapas', [MapaController::class, 'index']);
    Route::post('/mapas', [MapaController::class, 'store'])->name('mapas.store');
    Route::get('/mapas/{mapaId}/elementos', [MapaController::class, 'getElementos']);

    Route::get('/editor', function () {
        return Inertia::render('EditorMapa');
    })->name('editor');

    Route::post('/mapas/{mapa}/elementos', [MapaController::class, 'guardarElementos']);
    Route::post('/mapas/{mapa}/elementos/agregar', [MapaController::class, 'agregarElemento']);
    Route::delete('/mapas/elementos/{elementoMapa}', [MapaController::class, 'eliminarElemento']);

    // RUTAS DE PLANTILLAS
    Route::get('/plantillas/objetos', [PlantillaController::class, 'getObjetos']);
    Route::get('/plantillas/eventos', [PlantillaController::class, 'getEventos']);
});


require __DIR__.'/auth.php';
