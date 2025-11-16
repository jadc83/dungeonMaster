import React, { useEffect, useRef } from 'react';

// Creamos un objeto de imagen.
// Lo creamos fuera del componente para que no se cree
// una y otra vez en cada re-render.
const sprite = new Image();
sprite.src = '/token.png'; // Le decimos que cargue tu token de la carpeta /public

/**
 * Componente que renderiza un sprite de personaje en un <canvas>.
 */
export default function PersonajeCanvas({ personaje }) {
  const canvasRef = useRef(null);

  // Este hook se ejecuta cada vez que el 'personaje' cambie
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Si el canvas no está listo, no hace nada

    const context = canvas.getContext('2d');

    // Función para dibujar
    const dibujar = () => {
      // 1. Limpiamos el canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // 2. Dibujamos la imagen del token
      // (imagen, x, y, ancho, alto)
      context.drawImage(sprite, 0, 0, canvas.width, canvas.height);
    };

    // --- Lógica de carga de imagen ---
    // Comprobamos si la imagen ya se ha cargado.
    if (sprite.complete) {
      // Si ya está cargada (ej. ya se usó con otro personaje),
      // la dibujamos inmediatamente.
      dibujar();
    } else {
      // Si todavía se está descargando, le decimos que
      // llame a 'dibujar()' en cuanto termine.
      sprite.onload = dibujar;
    }

  }, [personaje]); // Se redibuja si el personaje cambia

  return (
    <canvas
      ref={canvasRef}
      width="70"  // Dimensiones lógicas (no las cambies)
      height="70"
      style={{
        width: '100%', // Se ajusta al 100% del <div> padre
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0
      }}
    />
  );
}
