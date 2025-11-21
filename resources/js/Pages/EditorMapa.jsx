import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Draggable from "react-draggable";
import { Link } from '@inertiajs/react';

// --- SERVICIOS REALES (Ahora llamarán a la API de Laravel) ---
import { plantillaService, mapaService } from '../services/mapaService';

// Tamaño fijo de los tokens de elementos y cuadrícula
const ELEMENT_TOKEN_SIZE = 40;


function EditorMapa() {
  // --- Estados Principales ---
  const [mapName, setMapName] = useState("");
  const [currentMapFile, setCurrentMapFile] = useState(null);
  const [currentMapUrl, setCurrentMapUrl] = useState(null);
  const [mapaGuardadoId, setMapaGuardadoId] = useState(null);

  // Plantillas cargadas de la DB (Objetos y Eventos)
  const [allTemplates, setAllTemplates] = useState({ objects: [], events: [] });

  // Instancias de Elementos colocados en el mapa
  const [mapElements, setMapElements] = useState([]);
  const [selectedElementId, setSelectedElementId] = useState(null);

  // --- Estado del Creador Lateral (Drawer) ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newElementData, setNewElementData] = useState({
    pos_x: 0,
    pos_y: 0,
    templateId: null,
    rango_activacion: 1,
  });

  const mapaRef = useRef(null);

  // Combina todas las plantillas para el selector del formulario
  const combinedTemplates = useMemo(() => {
    return [
      ...allTemplates.events.map(t => ({
        id: `e-${t.id}`,
        type: 'evento', // Asegúrate de que el tipo coincida con el backend
        name: t.nombre,
        icon: t.icon_url || '🚨'
      })),
      ...allTemplates.objects.map(t => ({
        id: `o-${t.id}`,
        type: 'object',
        name: t.denominacion,
        icon: t.icon_url || '✨'
      })),
    ];
  }, [allTemplates]);


  // --- Lógica de Carga Inicial ---
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const data = await plantillaService.getAllTemplates();
        // Asegurarse de que 'evento' esté asignado en PlantillaController.php
        setAllTemplates(data);
        console.log("Datos de Plantillas recibidos:", data);
      } catch (error) {
        console.error("Fallo al cargar plantillas:", error);
      }
    }
    fetchTemplates();
  }, []);


  // --- Manejadores de Mapa y Subida ---

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentMapFile(file);
      setCurrentMapUrl(URL.createObjectURL(file));
      setMapName(file.name.split('.')[0] || 'Nuevo Mapa');
    }
  };

  const handleSaveMap = async () => {
    if (!currentMapFile || !mapName) {
      alert("Debes seleccionar un archivo y darle un nombre.");
      return;
    }

    try {
      // 1. Guardar el mapa (que devuelve el ID del mapa)
      const newMap = await mapaService.uploadMap(currentMapFile, mapName);

      // --- CORRECCIÓN 1: Validar que el ID del mapa exista ---
      if (!newMap || !newMap.id) {
        throw new Error("Fallo al obtener el ID del mapa recién guardado. Revisa la función 'store' en MapaController.");
      }

      setMapaGuardadoId(newMap.id);

      // 2. Mapear los elementos para enviarlos al backend
      // El backend espera el ID de la plantilla bajo la clave 'id'.
      const elementsToSave = mapElements.map(el => ({
        id: el.elementable_id, // <--- Enviamos el ID real de la plantilla
        type: el.type,
        pos_x: el.pos_x,
        pos_y: el.pos_y,
        rango_activacion: el.rango_activacion,
      }));

      // 3. Guardar los elementos asociados al nuevo mapa ID
      await mapaService.saveElements(newMap.id, elementsToSave);

      alert(`Mapa "${mapName}" y sus elementos guardados con éxito! (ID: ${newMap.id})`);
    } catch (error) {
      console.error("Error al guardar el mapa:", error);
      alert(`Hubo un error al guardar el mapa: ${error.message || 'Error desconocido'}`);
    }
  };


  // --- Nuevo Flujo: Captura de Coordenadas y Apertura del Panel ---

  const manejarClickMapa = useCallback((e) => {
    if (!currentMapUrl) return;
    if (e.target !== e.currentTarget) return;

    const rect = mapaRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + mapaRef.current.scrollLeft;
    const clickY = e.clientY - rect.top + mapaRef.current.scrollTop;

    setNewElementData(prev => ({
      ...prev,
      pos_x: Math.round(clickX - ELEMENT_TOKEN_SIZE / 2),
      pos_y: Math.round(clickY - ELEMENT_TOKEN_SIZE / 2),
      templateId: null,
    }));
    setIsDrawerOpen(true);
    setSelectedElementId(null);
  }, [currentMapUrl]);

  // --- Lógica de Colocación (Una vez que el usuario selecciona la plantilla) ---

  const handlePlaceElement = (e) => {
    e.preventDefault();
    const templateData = combinedTemplates.find(t => t.id === newElementData.templateId);

    if (!templateData) {
      alert("Debes seleccionar una plantilla de Objeto o Evento.");
      return;
    }

    // El ID real de la plantilla es el sufijo después de 'e-' o 'o-'
    const elementableId = templateData.id.substring(2);

    const newElementInstance = {
      id: Date.now(), // ID temporal para React (No se envía a la DB)
      mapa_id: mapaGuardadoId,
      elementable_id: elementableId, // <--- ID real de la plantilla de la DB
      elementable_type: templateData.type, // 'object' o 'evento'
      type: templateData.type,
      pos_x: newElementData.pos_x,
      pos_y: newElementData.pos_y,
      rango_activacion: newElementData.rango_activacion,
      name: templateData.name,
      icon: templateData.icon,
    };

    setMapElements(prev => [...prev, newElementInstance]);
    setIsDrawerOpen(false);
    setNewElementData(prev => ({...prev, templateId: null}));
  };

  // --- Manejador de Arrastre ---
  const onStopElementDrag = useCallback((e, data, elementId) => {
    const { x, y } = data;
    setMapElements((prev) =>
      prev.map((el) =>
        el.id === elementId ? { ...el, pos_x: Math.round(x), pos_y: Math.round(y) } : el
      )
    );
  }, []);

  // --- Componente de Formulario de Creación Lateral ---
  const CreationDrawer = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    const currentTemplate = combinedTemplates.find(t => t.id === data.templateId);

    return (
      <div
        className="drawer-side-panel info-personaje"
        style={{
          padding: 20,
          zIndex: 1000,
          overflowY: 'auto',
        }}
      >
        <button onClick={onClose} style={{ float: 'right', fontSize: '1.5em', border: 'none', background: 'transparent' }}>&times;</button>
        <h3 className="info-titulo" style={{ marginTop: 0 }}>➕ Crear Elemento</h3>

        <p>Coordenadas (X, Y): **({data.pos_x + ELEMENT_TOKEN_SIZE / 2}, {data.pos_y + ELEMENT_TOKEN_SIZE / 2})**</p>
        <small>Posición del token: **({data.pos_x}, {data.pos_y})**</small>
        <hr style={{margin: '15px 0', borderTop: '1px solid #6b4c1d'}}/>

        <form onSubmit={handlePlaceElement}>

          <label style={{ display: 'block', marginBottom: 10 }}>
            <span className="form-label">Plantilla de Elemento:</span>
            <select
              value={data.templateId || ''}
              onChange={(e) => setNewElementData({...data, templateId: e.target.value})}
              className="form-input"
              required
            >
              <option value="">-- Selecciona Objeto o Evento --</option>
              <optgroup label="Objetos Disponibles">
                {allTemplates.objects.map(t => (
                  <option key={`o-${t.id}`} value={`o-${t.id}`}>
                    {t.icon_url} {t.denominacion}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Eventos Disponibles">
                {allTemplates.events.map(t => (
                  <option key={`e-${t.id}`} value={`e-${t.id}`}>
                    {t.icon_url} {t.nombre}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>

          {currentTemplate && (
            <div style={{ padding: 10, border: '1px solid #6b4c1d', margin: '15px 0', borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.7)' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#3e2d0a' }}>{currentTemplate.name} ({currentTemplate.type === 'evento' ? 'Evento' : 'Objeto'})</h4>

              <label style={{ display: 'block', marginTop: 15 }}>
                <span className="form-label">Rango de Activación (unidades):</span>
                <input
                  type="number"
                  min="0"
                  value={data.rango_activacion}
                  onChange={(e) => setNewElementData({...data, rango_activacion: parseInt(e.target.value)})}
                  className="form-input"
                />
              </label>
              <small className="form-explicacion">Este es el rango para la función `ondas`.</small>
            </div>
          )}

          <button
            type="submit"
            disabled={!data.templateId}
            className="form-submit-btn"
          >
            Colocar Elemento en Mapa
          </button>
        </form>
      </div>
    );
  };


  // --- Renderización Principal ---
  return (
    <div className="tablero-wrapper">

      {/* Panel Izquierdo de Controles */}
      <div className="panel-izquierda" style={{ display: 'flex', flexDirection: 'column', flex: 1, maxHeight: '100%' }}>

        {/* Cabecera / Controles de Mapa */}
        <div className="panel-controles" style={{ paddingBottom: 20, borderBottom: '2px solid #8a6d3e', flexShrink: 0 }}>
          <h2 className="lista-titulo" style={{ marginBottom: 10 }}>
            <span>⚙️ Editor de Mapas</span>
            <Link href="/" className="reset-button">
                Volver al Tablero
            </Link>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ padding: 5, border: '1px solid #6b4c1d', borderRadius: 5, backgroundColor: '#f9f5e4' }}
            />
            <input
              type="text"
              placeholder="Nombre del Mapa"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              className="form-input"
            />
            <button
                onClick={handleSaveMap}
                disabled={!currentMapFile}
                className="form-submit-btn"
                style={{ backgroundColor: '#2a5d1b', boxShadow: '0 0 10px #70a75f' }}
            >
              Guardar Mapa ({mapElements.length} elementos)
            </button>
            {mapaGuardadoId && (
                <small style={{textAlign: 'center', color: '#4CAF50'}}>Mapa guardado con ID: {mapaGuardadoId}</small>
            )}
          </div>
        </div>

        {/* Lista de Elementos Colocados */}
        <div style={{ flexGrow: 1, overflowY: 'auto', paddingTop: 20 }}>
            <h3 className="lista-titulo" style={{ marginTop: 0 }}>
                Elementos en el Mapa
            </h3>
            <div className="lista-scroll" style={{maxHeight: 'none'}}>
                <ul className="lista-tablero">
                    {mapElements.map(el => (
                        <li
                            key={el.id}
                            onClick={() => setSelectedElementId(el.id)}
                            className={`pj-card ${el.id === selectedElementId ? 'seleccionado' : ''}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 10
                            }}
                        >
                            <span style={{ fontSize: '1.5em', flexShrink: 0 }}>{el.icon}</span>
                            <div style={{ flexGrow: 1 }}>
                                <div className="nombre" style={{ margin: 0, fontSize: '1em' }}>{el.name}</div>
                                <small>({el.pos_x}, {el.pos_y}) - {el.type === 'evento' ? 'Evento' : 'Objeto'}</small>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMapElements(prev => prev.filter(p => p.id !== el.id));
                                    setSelectedElementId(null);
                                }}
                                style={{
                                    background: '#c0392b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: 25,
                                    height: 25,
                                    fontSize: '1em',
                                    flexShrink: 0
                                }}
                            >
                                &times;
                            </button>
                        </li>
                    ))}
                    {mapElements.length === 0 && (
                        <div className="text-xs italic opacity-80 text-center" style={{color: '#d4af37', padding: '10px'}}>
                            Haz clic en el mapa para empezar a colocar elementos.
                        </div>
                    )}
                </ul>
            </div>
        </div>

      </div>

      {/* Área del Mapa Central */}
      <div
        ref={mapaRef}
        className="tablero-mapa"
        onClick={manejarClickMapa}
        style={{
          flex: 3,
          height: 'auto',
          overflow: 'auto',
          position: 'relative',
          cursor: currentMapUrl ? 'crosshair' : 'default',
          backgroundImage: currentMapUrl ? `url('${currentMapUrl}')` : 'none',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: currentMapUrl ? 'transparent' : '#333',
          minHeight: currentMapUrl ? '100%' : '500px',
        }}
      >
        {!currentMapUrl && (
            <div style={{color: 'white', padding: 20, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                Sube un mapa para empezar a editar y colocar elementos.
            </div>
        )}

        {/* Renderizado de Objetos y Eventos Colocados */}
        {mapElements.map(el => (
          <Draggable
            key={el.id}
            bounds="parent"
            defaultPosition={{ x: el.pos_x, y: el.pos_y }}
            onStop={(e, data) => onStopElementDrag(e, data, el.id)}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElementId(el.id);
              }}
              className={`map-element-token ${el.type} ${el.id === selectedElementId ? 'selected' : ''}`}
              style={{
                position: 'absolute',
                width: ELEMENT_TOKEN_SIZE,
                height: ELEMENT_TOKEN_SIZE,
                borderRadius: '50%',
                backgroundColor: el.type === 'evento' ? 'rgba(255,140,0,0.8)' : 'rgba(0,191,255,0.8)',
                border: el.id === selectedElementId ? '3px solid gold' : '2px solid black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'grab',
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '18px',
                lineHeight: 1
              }}
            >
              {el.icon}
            </div>
          </Draggable>
        ))}

      </div>

      {/* Panel Derecho */}
      <div className="panel-derecha" style={{ flex: 1, position: 'relative' }}>
          {/* Aquí se renderiza el Drawer */}
          <CreationDrawer
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              data={newElementData}
          />
          {/* Mensaje de Info si el Drawer está cerrado */}
          {!isDrawerOpen && selectedElementId && mapElements.find(el => el.id === selectedElementId) && (
              <div className="info-personaje">
                  <h3 className="info-titulo" style={{ marginTop: 0 }}>Detalles del Elemento</h3>
                  <p><strong>ID Temporal:</strong> {selectedElementId}</p>
                  <p><strong>Plantilla DB ID:</strong> {mapElements.find(el => el.id === selectedElementId).elementable_id}</p>
                  <p><strong>Plantilla:</strong> {mapElements.find(el => el.id === selectedElementId).name}</p>
                  <p><strong>Tipo:</strong> {mapElements.find(el => el.id === selectedElementId).type}</p>
                  <p><strong>Coordenadas (X, Y):</strong> ({mapElements.find(el => el.id === selectedElementId).pos_x}, {mapElements.find(el => el.id === selectedElementId).pos_y})</p>
                  <p><strong>Rango:</strong> {mapElements.find(el => el.id === selectedElementId).rango_activacion}</p>
              </div>
          )}
          {!isDrawerOpen && !selectedElementId && (
              <div className="info-personaje">
                  <h3 className="info-titulo" style={{ marginTop: 0 }}>Instrucciones</h3>
                  <p>1. Sube un archivo de mapa.</p>
                  <p>2. Haz **clic en el mapa** para abrir el panel de creación.</p>
                  <p>3. Selecciona una plantilla y guarda el elemento.</p>
                  <p>4. Arrastra los tokens para ajustar su posición.</p>
                  <p>5. ¡Guarda el mapa y los elementos!</p>
              </div>
          )}
      </div>

    </div>
  );
}

export default EditorMapa;
