import axios from "axios";

/**
 * Este objeto centraliza todas las llamadas API
 * relacionadas con los personajes.
 */
export const personajeService = {

  /**
   * Obtiene todos los personajes de la base de datos.
   */
  getAll: async () => {
    const res = await axios.get("/personajes");
    return res.data;
  },

  /**
   * Actualiza la posición de un personaje específico.
   * @param {string} personajeId - El ID del personaje a mover.
   * @param {number} posX - La nueva coordenada X.
   * @param {number} posY - La nueva coordenada Y.
   */
  updatePosicion: (personajeId, posX, posY) => {
    // No usamos 'await' aquí, dejamos que el componente
    // decida si quiere esperar o no.
    return axios.patch(`/personajes/${personajeId}`, {
      pos_x: posX,
      pos_y: posY,
    });
  },

  /**
   * Resetea la posición de una lista de personajes a (0,0).
   * @param {Array} personajes - Array de personajes a resetear.
   */
  resetAllPosiciones: (personajes) => {
    // Esto es mucho más rápido que un bucle 'for':
    // Crea un array de todas las peticiones (promesas)
    const promesas = personajes.map(p =>
      axios.patch(`/personajes/${p.id}`, { pos_x: 0, pos_y: 0 })
    );
    // Ejecuta todas las peticiones en paralelo
    return Promise.all(promesas);
  }
};
