import React, { useEffect, useRef } from 'react';

// URL del token por defecto si el personaje no tiene uno
const DEFAULT_TOKEN = '/token.png';

/**
 * Componente que renderiza un sprite de personaje en un <canvas>.
 * Carga dinámicamente el avatar del personaje o un token por defecto.
 */
export default function PersonajeCanvas({ personaje }) {
  const canvasRef = useRef(null);

  // Este hook se ejecuta cada vez que el 'personaje' (y su avatar_url) cambie
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Si el canvas no está listo, no hace nada

    const context = canvas.getContext('2d');

    // 1. Determina qué imagen cargar
    // Si avatar_url existe, úsalo. Si no, usa el token por defecto.
    const imageUrl = personaje.avatar_url || DEFAULT_TOKEN;

    // 2. Crea un nuevo objeto de imagen para CADA token
    // Esto es necesario porque cada personaje puede tener una imagen distinta
    const sprite = new Image();
    sprite.src = imageUrl;

    // 3. Función para dibujar
    const dibujar = () => {
      // Limpiamos el canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Dibujamos la imagen (ya sea la del personaje o la de por defecto)
      context.drawImage(sprite, 0, 0, canvas.width, canvas.height);
    };

    // 4. Lógica de carga
    // Comprobamos si la imagen ya se ha cargado (está en caché)
    if (sprite.complete) {
      dibujar();
    } else {
      // Si no, esperamos a que termine de descargarse para dibujarla
      sprite.onload = dibujar;
      // Opcional: Manejar error si la URL está rota
      sprite.onerror = () => {
        console.error(`Error al cargar la imagen: ${imageUrl}`);
        // Podríamos dibujar un token rojo de error aquí
      };
    }

  }, [personaje.avatar_url]); // <-- Se actualiza solo si la URL del avatar cambia

  return (
    <canvas
      ref={canvasRef}
      width="70"  // Dimensiones lógicas
      height="70"
      style={{
        width: '100%', // Se ajusta al 100% del <div> padre
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        borderRadius: '50%'
      }}
    />
  );
}
