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
   ** @param {number} posX - La nueva coordenada X.
   * @param {number} posY - La nueva coordenada Y.
   */
  updatePosicion: (personajeId, posX, posY) => {
    return axios.patch(`/personajes/${personajeId}`, {
      pos_x: posX,
      pos_y: posY,
    });
  },

  // --- resetAllPosiciones() ELIMINADO ---

  /**
   * Actualiza un único stat de un personaje.
   * @param {string} personajeId - El ID del personaje.
   * @param {string} stat - El nombre del stat (ej: 'hp', 'mp', 'cordura').
   * @param {number} value - El nuevo valor del stat.
   */
  updateStat: (personajeId, stat, value) => {
    return axios.patch(`/personajes/${personajeId}`, {
      [stat]: value
    });
  }
};
