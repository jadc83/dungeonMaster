// Rango de las ondas en píxeles
const RANGO_ONDAS = 150;

/**
 * Calcula la distancia en píxeles entre dos entidades
 * (Cualquier cosa que tenga pos_x y pos_y).
 */
export function calcularDistancia(p1, p2) { // <-- ¡ASEGÚRATE QUE ESTE 'export' EXISTE!
  if (!p1 || !p2) return 0;

  const dx = p1.pos_x - p2.pos_x;
  const dy = p1.pos_y - p2.pos_y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Encuentra los IDs de personajes en rango de una posición específica.
 */
export function calcularOndas(personajesEnTablero, atacanteId, posX, posY) { // <-- ¡Y ESTE!

  const centroOnda = { pos_x: posX, pos_y: posY };

  return personajesEnTablero
    .filter((p) => p.id !== atacanteId) // Excluye al propio personaje
    .filter((p) => {
      // Reutilizamos nuestra función de distancia
      const dist = calcularDistancia(p, centroOnda);
      return dist <= RANGO_ONDAS;
    })
    .map(p => p.id);
}
