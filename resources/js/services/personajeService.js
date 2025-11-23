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
   * Obtiene los detalles de un personaje específico con inclusiones opcionales.
   * @param {string} personajeId - El ID del personaje.
   * @param {string} include - Relaciones a incluir (ej: 'inventario').
   */
  getPersonajeDetails: async (personajeId, include = null) => {
    const url = include ? `/personajes/${personajeId}?include=${include}` : `/personajes/${personajeId}`;
    const res = await axios.get(url);
    return res.data;
  },

  // --- NUEVA FUNCIÓN: Obtener Inventario ---

  /**
   * Obtiene el inventario completo (objetos poseídos con cantidad y estado)
   * de un personaje específico, cargando la relación 'inventario'.
   * @param {string} personajeId - El ID del personaje.
   */
  getInventario: async (personajeId) => {
    // Solicitamos el personaje con la relación 'inventario' cargada.
    const res = await axios.get(`/personajes/${personajeId}?include=inventario`);
    // Retornamos solo la data del inventario para simplicidad en el frontend.
    return res.data.inventario;
  },

  // --- NUEVA FUNCIÓN: Recoger Objeto ---

  /**
   * Maneja la acción de recoger un objeto del mapa.
   * Esto puede resultar en un INSERT o un UPDATE en la tabla pivot 'personaje_objeto'.
   *
   * @param {string} personajeId - El ID del personaje que recoge el objeto.
   * @param {string} objetoId - El ID del objeto que se recoge.
   * @param {number} cantidad - La cantidad del objeto a recoger (por defecto, 1).
   */
  recogerObjeto: (personajeId, objetoId, cantidad = 1) => {
    return axios.post(`/personajes/${personajeId}/inventario/recoger`, {
      objeto_id: objetoId,
      cantidad: cantidad,
    });
  },

  // --- FUNCIONES EXISTENTES ---

  /**
   * Actualiza la posición de un personaje específico.
   * @param {string} personajeId - El ID del personaje a mover.
   * @param {number} posX - La nueva coordenada X.
   * @param {number} posY - La nueva coordenada Y.
   */
  updatePosicion: (personajeId, posX, posY) => {
    return axios.patch(`/personajes/${personajeId}`, {
      pos_x: posX,
      pos_y: posY,
    });
  },

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
