import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            // ¡CÁMBIALO A UN ARRAY!
            input: [
                'resources/js/app.jsx',
                'resources/css/Tablero.css' // <-- AÑADE TU CSS AQUÍ
            ],
            ssr: 'resources/js/ssr.jsx',
            refresh: true,
        }),
        react(),
    ],
});
