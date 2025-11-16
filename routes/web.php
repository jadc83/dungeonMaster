<?php

use App\Http\Controllers\PersonajeController;
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
});
Route::get('/personajes', [PersonajeController::class, 'index']);

Route::patch('/personajes/{personaje}', [PersonajeController::class, 'update']);

Route::get('/personajes/crear', function () {
    return Inertia::render('CrearPersonaje');
});
Route::post('/personajes', [PersonajeController::class, 'store']);

Route::get('/tablero', function () {
    return Inertia::render('Tablero');
});




require __DIR__.'/auth.php';
