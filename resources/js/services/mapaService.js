// resources/js/services/mapaService.js

import axios from 'axios';

// --- SERVICIO DE PLANTILLAS ---
export const plantillaService = {
  async getAllTemplates() {
    try {
      // 1. OBTENER OBJETOS (Llama a /plantillas/objetos en routes/web.php)
      const objectsResponse = await axios.get('/plantillas/objetos');

      // 2. Obtener Eventos (Llama a /plantillas/eventos en routes/web.php)
      const eventsResponse = await axios.get('/plantillas/eventos');

      return {
        objects: objectsResponse.data.map(obj => ({
            id: obj.id,
            denominacion: obj.denominacion,
            valor: obj.valor, // <-- Añadido para que el frontend lo reciba
            type: 'object',
            icon_url: obj.icon_url || '✨',
        })),
        events: eventsResponse.data,
      };
    } catch (error) {
      console.error("Error al cargar plantillas desde el API. Asegúrate de que las rutas GET están en routes/web.php y los Controladores están correctos.", error.response || error);
      return { objects: [], events: [] };
    }
  }
};


// --- SERVICIO DE MAPA REAL (Conexión a MapaController) ---
export const mapaService = {

  /**
   * Obtiene todos los mapas disponibles. Llama a: GET /mapas
   */
  async getAllMaps() {
    try {
      // Asume que la ruta GET /mapas te devuelve la lista completa
      const response = await axios.get('/mapas');
      return response.data; // Debería ser un array de objetos de mapa
    } catch (error) {
      console.error("Error al cargar mapas desde el API.", error.response || error);
      return [];
    }
  },

  // --- ¡NUEVA FUNCIÓN! ---
  /**
   * Obtiene los elementos (tokens) asociados a un mapa por su ID.
   * Llama a: GET /mapas/{mapaId}/elementos
   */
  async getMapElements(mapId) {
    try {
      const response = await axios.get(`/mapas/${mapId}/elementos`);
      return response.data;
    } catch (error) {
      console.error("Error al cargar elementos del mapa:", error.response || error);
      return [];
    }
  },

  /**
   * Sube el archivo de imagen y crea el registro del mapa. Llama a: POST /mapas
   */
  async uploadMap(mapFile, mapName) {
    const formData = new FormData();
    formData.append('map_file', mapFile); // <-- Cambiado de 'imagen' a 'map_file'
    formData.append('nombre', mapName);

    try {
      // Llamada a POST /mapas (en routes/web.php)
      const response = await axios.post('/mapas', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error al subir el mapa a Laravel:", error.response || error);
      throw new Error(`Fallo la subida del mapa. (${error.response?.data?.message || error.message})`);
    }
  },

  /**
   * Guarda todas las instancias de elementos (tokens). Llama a: POST /mapas/{mapId}/elementos
   */
  async saveElements(mapId, elements) {
    try {
      // Llamada a POST /mapas/{mapId}/elementos (en routes/web.php)
      const response = await axios.post(`/mapas/${mapId}/elementos`, {
        elements: elements
      });
      return response.data;
    } catch (error) {
      console.error("Error al guardar elementos en Laravel:", error.response || error);
      throw new Error(`Fallo el guardado de elementos. (${error.response?.data?.message || error.message})`);
    }
  },

  /**
   * Elimina un elemento específico del mapa.
   * Se usa cuando un personaje recoge un objeto.
   */
  async deleteElement(elementId) {
    try {
      const response = await axios.delete(`/mapas/elementos/${elementId}`);
      return response.data;
    } catch (error) {
      console.error("Error al eliminar elemento del mapa:", error.response || error);
      throw new Error(`Error al eliminar elemento. (${error.response?.data?.message || error.message})`);
    }
  },

  /**
   * Añade un elemento individual al mapa (arrastrando desde el panel).
   */
  async addElement(mapId, elementData) {
    try {
      const response = await axios.post(`/mapas/${mapId}/elementos/agregar`, elementData);
      return response.data;
    } catch (error) {
      console.error("Error al añadir elemento al mapa:", error.response || error);
      throw new Error(`Error al añadir elemento. (${error.response?.data?.message || error.message})`);
    }
  }
};
