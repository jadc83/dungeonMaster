import React, { useEffect, useState, useRef } from "react";
import Draggable from "react-draggable";
import { Link } from '@inertiajs/react';

// Tus archivos separados
import InfoPersonaje from './InfoPersonaje';
import { calcularDistancia, calcularOndas as calcularOndasUtil } from '../utils/logicaTablero';
import { personajeService } from '../services/personajeService';
import PersonajeCanvas from './PersonajeCanvas';
import PersonajeCard from './PersonajeCard';

// Constantes del Token
const TOKEN_CENTER_OFFSET = 35;

// --- ¡LISTA DE MAPAS DISPONIBLES! ---
const MAP_LIST = [
  { name: 'La Taberna', path: '/mapa.jpg' },
  { name: 'Exterior (Bosque)', path: '/mapa2.jpg' },
  // Puedes añadir más aquí, ej: { name: 'Cripta', path: '/cripta.jpg' }
];

function Tablero() {
  const [personajes, setPersonajes] = useState([]);
  const [personajesEnTablero, setPersonajesEnTablero] = useState([]);
  const [selectedPersonajeId, setSelectedPersonajeId] = useState(null);
  const [objetivoPersonajeId, setObjetivoPersonajeId] = useState(null);
  const [modoAtaque, setModoAtaque] = useState(false);
  const [distancia, setDistancia] = useState(null);
  const [modoSeleccionMultiple, setModoSeleccionMultiple] = useState(false);
  const [seleccionMultipleIds, setSeleccionMultipleIds] = useState([]);
  const [personajeEnMovimientoId, setPersonajeEnMovimientoId] = useState(null);
  const [ondasIds, setOndasIds] = useState([]);
  const [menuCircular, setMenuCircular] = useState({ visible: false, personajeId: null, x: 0, y: 0, closing: false });
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerClosing, setBannerClosing] = useState(false);
  const [attackerPulseKey, setAttackerPulseKey] = useState(null);
  const [isAvailableListOpen, setIsAvailableListOpen] = useState(true);

  // --- ¡NUEVOS ESTADOS PARA EL MAPA! ---
  const [currentMap, setCurrentMap] = useState(MAP_LIST[0].path); // Mapa actual
  const [isMapModalOpen, setIsMapModalOpen] = useState(false); // Visibilidad del modal

  const mapaRef = useRef(null);

  useEffect(() => {
    async function fetchPersonajes() {
      const data = await personajeService.getAll();
      setPersonajes(data);
    }
    fetchPersonajes();
  }, []);

  useEffect(() => {
    if (modoAtaque) {
      setBannerClosing(false);
      setBannerVisible(true);
    } else if (bannerVisible) {
      setBannerClosing(true);
      setTimeout(() => {
        setBannerVisible(false);
        setBannerClosing(false);
      }, 500);
    }
  }, [modoAtaque]);


  useEffect(() => {
    if (!selectedPersonajeId) {
      setOndasIds([]);
      return;
    }
    const atacante = personajesEnTablero.find(p => p.id === selectedPersonajeId);
    if (!atacante) {
      setOndasIds([]);
      return;
    }
    const idsEnRango = calcularOndasUtil(personajesEnTablero, atacante.id, atacante.pos_x, atacante.pos_y);
    const timestamp = Date.now();
    const ondasConTimestamp = idsEnRango.map(id => ({ id: id, timestamp: timestamp }));
    setOndasIds(ondasConTimestamp);
  }, [selectedPersonajeId, personajesEnTablero]);


  const cerrarMenuCircular = (force = false) => {
    if (!menuCircular.visible) return;
    if (force) {
      setMenuCircular({ visible: false, personajeId: null, x: 0, y: 0, closing: false });
      return;
    }
    setMenuCircular(prev => ({ ...prev, closing: true }));
    setTimeout(() => {
      setMenuCircular({ visible: false, personajeId: null, x: 0, y: 0, closing: false });
    }, 200);
  };

  const onStartDrag = (personajeId) => {
    setPersonajeEnMovimientoId(personajeId);
    cerrarMenuCircular(true);
  };

  const onStopDrag = async (e, data, personajeId) => {
    const { x, y } = data;
    setPersonajeEnMovimientoId(null);
    const posXRedondeada = Math.round(x);
    const posYRedondeada = Math.round(y);

    setPersonajesEnTablero((prev) =>
      prev.map((p) =>
        p.id === personajeId ? { ...p, pos_x: posXRedondeada, pos_y: posYRedondeada } : p
      )
    );

    try {
      await personajeService.updatePosicion(personajeId, posXRedondeada, posYRedondeada);
    } catch (error) {
      console.error("Error actualizando posición", error);
    }
  };

  const agregarAPersonajeEnTablero = (personaje) => {
    if (!personajesEnTablero.find((p) => p.id === personaje.id)) {
      setPersonajesEnTablero([...personajesEnTablero, personaje]);
    }
  };

  const calcularOndas = () => {};

  useEffect(() => {
    if (modoAtaque && selectedPersonajeId && objetivoPersonajeId) {
      const atacante = personajesEnTablero.find(p => p.id === selectedPersonajeId);
      const objetivo = personajesEnTablero.find(p => p.id === objetivoPersonajeId);
      if (atacante && objetivo) {
        const dist = calcularDistancia(atacante, objetivo);
        setDistancia(dist.toFixed(2));
      } else {
        setDistancia(null);
      }
    } else {
      setDistancia(null);
    }
  }, [personajesEnTablero, modoAtaque, selectedPersonajeId, objetivoPersonajeId]);

  const toggleModoAtaque = () => {
    if (!selectedPersonajeId) {
      alert("Debes seleccionar un personaje para activar el modo ataque.");
      return;
    }

    setModoAtaque((v) => {
      const isEnteringAttackMode = !v;

      if (isEnteringAttackMode) {
        setAttackerPulseKey(Date.now());
      } else {
        setDistancia(null);
        setObjetivoPersonajeId(null);
      }
      return isEnteringAttackMode;
    });
    cerrarMenuCircular();
  };

  const seleccionarPersonaje = (personajeId) => {
    if (!modoSeleccionMultiple && !modoAtaque) {
      setSelectedPersonajeId(personajeId);
      setDistancia(null);
      setObjetivoPersonajeId(null);
    }
  };

  const manejarClickPersonajeEnAtaque = (objetivoId) => {
    if (modoAtaque && selectedPersonajeId !== null && objetivoId !== selectedPersonajeId) {
      setObjetivoPersonajeId(objetivoId);
    }
    cerrarMenuCircular();
  };

  const manejarClickListaPersonaje = (personajeId) => {
    if (modoAtaque) {
      if (selectedPersonajeId === null) {
        setSelectedPersonajeId(personajeId);
        setObjetivoPersonajeId(null);
        setDistancia(null);
      } else if (personajeId !== selectedPersonajeId) {
        setObjetivoPersonajeId(personajeId);
        const atacante = personajesEnTablero.find(p => p.id === selectedPersonajeId);
        const objetivo = personajesEnTablero.find(p => p.id === personajeId);
        if (atacante && objetivo) {
            const dist = calcularDistancia(atacante, objetivo);
            setDistancia(dist.toFixed(2));
        } else {
            setDistancia(null);
        }
      } else {
        setObjetivoPersonajeId(null);
        setDistancia(null);
      }
    } else if (!modoSeleccionMultiple) {
      setSelectedPersonajeId(personajeId);
      setDistancia(null);
      setObjetivoPersonajeId(null);
    }
    cerrarMenuCircular();
  };

  const manejarClickTablero = (e) => {
    if (e.target === e.currentTarget) {
      if (modoSeleccionMultiple && e.type === "contextmenu") {
        e.preventDefault();
        setModoSeleccionMultiple(false);
        setSeleccionMultipleIds([]);
        setOndasIds([]);
        return;
      }
      if (!modoAtaque) {
        setSelectedPersonajeId(null);
        setObjetivoPersonajeId(null);
        setDistancia(null);
        setOndasIds([]);
      }
    }
    cerrarMenuCircular();
  };

  const manejarClickDerechoPersonaje = (e, personaje) => {
    e.preventDefault();
    e.stopPropagation();

    if (modoAtaque) return;

    if (personaje.id === selectedPersonajeId && !modoSeleccionMultiple) {
      abrirMenuCircular(e, personaje);
    } else {
      if (!modoSeleccionMultiple) {
        setModoSeleccionMultiple(true);
        setSeleccionMultipleIds([personaje.id]);
        setSelectedPersonajeId(null);
        setObjetivoPersonajeId(null);
        setDistancia(null);
        setModoAtaque(false);
        setOndasIds([]);
      } else {
        setSeleccionMultipleIds((prev) =>
          prev.includes(personaje.id)
            ? prev.filter((id) => id !== personaje.id)
            : [...prev, personaje.id]
        );
      }
    }
  };

  // --- resetearPosiciones() ELIMINADO ---

  const atacante = personajesEnTablero.find((p) => p.id === selectedPersonajeId);
  const objetivo = personajesEnTablero.find((p) => p.id === objetivoPersonajeId);
  const personajesMultiple = personajesEnTablero.filter((p) => seleccionMultipleIds.includes(p.id));

  const abrirMenuCircular = (e, personaje) => {
    e.stopPropagation();
    if (menuCircular.visible && menuCircular.personajeId === personaje.id) {
      cerrarMenuCircular();
      return;
    }
    const x = personaje.pos_x + TOKEN_CENTER_OFFSET;
    const y = personaje.pos_y + TOKEN_CENTER_OFFSET;
    setMenuCircular({ visible: true, personajeId: personaje.id, x: x, y: y, closing: false });
  };

  const handleMenuOpcion = (opcion) => {
    const pj = personajesEnTablero.find(p => p.id === menuCircular.personajeId);
    alert(`Has seleccionado "${opcion}" para ${pj.nombre}`);
    cerrarMenuCircular();
  };

  const handleStatChange = async (e, personajeId, stat, cantidad) => {
    if (e) e.stopPropagation();

    const personaje = personajesEnTablero.find(p => p.id === personajeId);
    if (!personaje) return;

    const hpMax = personaje.hp_maximo || 10;
    const mpMax = personaje.mp_maximo || 10;
    const corduraMax = personaje.cordura_maxima || 99;

    let maxStat = 99;
    if (stat === 'hp') maxStat = hpMax;
    if (stat === 'mp') maxStat = mpMax;
    if (stat === 'cordura') maxStat = corduraMax;

    const currentValue = personaje[stat];
    let newValue = currentValue + cantidad;

    if (newValue < 0) newValue = 0;
    if (newValue > maxStat) newValue = maxStat;

    if (newValue === currentValue) return;

    setPersonajesEnTablero(prev =>
        prev.map(p =>
            p.id === personajeId ? { ...p, [stat]: newValue } : p
        )
    );

    try {
        await personajeService.updateStat(personajeId, stat, newValue);
    } catch (error) {
        console.error(`Error al actualizar ${stat}`, error);
        setPersonajesEnTablero(prev =>
            prev.map(p =>
                p.id === personajeId ? { ...p, [stat]: currentValue } : p
            )
        );
    }
  };

  const handleResucitar = async (e, personajeId) => {
    e.stopPropagation();
    const personaje = personajesEnTablero.find(p => p.id === personajeId);
    if (!personaje) return;
    const hpMax = personaje.hp_maximo || 10;
    setPersonajesEnTablero(prev =>
        prev.map(p =>
            p.id === personajeId ? { ...p, hp: hpMax } : p
        )
    );
    try {
        await personajeService.updateStat(personajeId, 'hp', hpMax);
    } catch (error) {
        console.error(`Error al resucitar`, error);
        setPersonajesEnTablero(prev =>
            prev.map(p =>
                p.id === personajeId ? { ...p, hp: 0 } : p
            )
        );
    }
  };

  const handleEjecutarAtaque = () => {
    if (!modoAtaque || !atacante || !objetivo) {
      alert("Debes seleccionar un atacante y un objetivo válido.");
      return;
    }

    const isEnRango = ondasIds.some(onda => onda.id === objetivo.id);
    if (!isEnRango) {
      alert(`${objetivo.nombre} está fuera de rango.`);
      return;
    }

    console.log(`Atacando a: ${objetivo.nombre}`);
    handleStatChange(null, objetivo.id, 'hp', -1);

    // Reseteamos el objetivo, pero seguimos en modo ataque
    setObjetivoPersonajeId(null);
    setDistancia(null);
  };


  return (
    <div
      className="tablero-wrapper"
      style={{ userSelect: modoSeleccionMultiple ? "none" : "auto" }}
    >
      {/* --- PANEL IZQUIERDO REESTRUCTURADO --- */}
      <div className="panel-izquierda">

        {/* --- 1. SECCIÓN FIJA SUPERIOR (Controles) --- */}
        <div style={{ flexShrink: 0, paddingBottom: '10px', borderBottom: '2px solid #8a6d3e' }}>

          {/* Título y Botones de Creación/Mapa */}
          <h3 className="lista-titulo" style={{ marginBottom: '10px' }}>
            <span>Controles</span>
            <div className="flex gap-2"> {/* Agrupamos botones */}
              <Link
                href="/personajes/crear"
                className="reset-button"
                onClick={(e) => e.stopPropagation()}
              >
                Crear Personaje
              </Link>
              {/* --- ¡NUEVO BOTÓN CAMBIAR MAPA! --- */}
              <button
                onClick={() => setIsMapModalOpen(true)}
                className="reset-button"
              >
                Cambiar Mapa
              </button>
            </div>
          </h3>

          {/* Botones de Acción */}
          <div className="flex gap-2">
            <button
              onClick={toggleModoAtaque}
              disabled={!selectedPersonajeId}
              className={`atacar-btn ${modoAtaque ? "modo-ataque-activo" : ""}`}
              style={{flexGrow: 1}} // Ocupa espacio
            >
              {modoAtaque ? "Salir de Ataque" : "Atacar"}
            </button>

            {modoAtaque && objetivoPersonajeId && (
              <button
                className="execute-attack-btn"
                onClick={handleEjecutarAtaque}
                style={{flexGrow: 1}}
              >
                ⚔️ ¡Confirmar Ataque!
              </button>
            )}
          </div>
        </div>

        {/* --- 2. SECCIÓN SCROLLABLE INFERIOR (Listas) --- */}
        <div style={{ flexGrow: 1, overflowY: 'auto', paddingTop: '10px' }}>

          {/* --- LISTA 1: PERSONAJES DISPONIBLES (COLAPSABLE) --- */}
          <h3
            className="lista-titulo"
            onClick={() => setIsAvailableListOpen(!isAvailableListOpen)}
            style={{ cursor: 'pointer', userSelect: 'none', borderTop: '2px solid #8a6d3e', paddingTop: '10px' }}
          >
            <span>
              {isAvailableListOpen ? '▼' : '►'}{" "}
              Personajes Disponibles
            </span>
          </h3>

          {isAvailableListOpen && (
            <div className="lista-scroll" style={{marginTop: '10px', maxHeight: '25vh'}}>
              <div className="flex flex-col gap-2">
                {personajes
                  .filter(p => !personajesEnTablero.find(pj => pj.id === p.id))
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex justify-between items-center p-2 rounded-lg transition-all hover:bg-black/20"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        border: '1px solid #6b4c1d'
                      }}
                    >
                      <div>
                        <span className="font-bold text-sm">{p.nombre}</span>
                        <span className="text-xs italic block opacity-80" style={{color: '#d4af37'}}>
                          {p.profesion}
                        </span>
                      </div>
                      <button
                        className="agregar-btn text-xl"
                        onClick={(e) => {
                            e.stopPropagation();
                            agregarAPersonajeEnTablero(p);
                        }}
                        aria-label={`Añadir a ${p.nombre}`}
                      >
                        +
                      </button>
                    </div>
                ))}

                {personajes.filter(p => !personajesEnTablero.find(pj => pj.id === p.id)).length === 0 && (
                  <div className="text-xs italic opacity-80 text-center" style={{color: '#d4af37', padding: '10px'}}>
                    No hay más personajes disponibles.
                  </div>
                )}
              </div>
            </div>
          )}
          {/* --- FIN DE LA LISTA 1 --- */}


          {/* --- LISTA 2: PERSONAJES EN JUEGO (SIEMPRE VISIBLE) --- */}
          <h3 className="lista-titulo" style={{ marginTop: 20 }}>
            Personajes en el tablero
          </h3>
          <div className="lista-scroll" style={{maxHeight: 'none'}}>
            <ul className="lista-tablero">
              {personajesEnTablero.map((p) => (
                  <PersonajeCard
                    key={p.id}
                    p={p}
                    isDead={p.hp <= 0}
                    isSelected={p.id === selectedPersonajeId}
                    isObjetivo={modoAtaque && p.id === objetivoPersonajeId}
                    onClick={() => !(p.hp <= 0) && manejarClickListaPersonaje(p.id)}
                    onStatChange={handleStatChange}
                    onResucitar={handleResucitar}
                  />
              ))}
            </ul>
          </div>
          {/* --- FIN DE LA LISTA 2 --- */}

        </div>
      </div> {/* --- FIN DEL PANEL IZQUIERDO --- */}


      {/* --- INICIO DEL MAPA (¡MODIFICADO!) --- */}
      <div
        ref={mapaRef}
        className="tablero-mapa"
        onClick={manejarClickTablero}
        onContextMenu={manejarClickTablero}
        style={{
          // --- ¡BACKGROUNDIMAGE AHORA ES DINÁMICO! ---
          backgroundImage: `url('${currentMap}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'rgba(0,0,0,0.4)',
          backgroundBlendMode: 'darken'
        }}
      >

        {bannerVisible && (
          <div className={`attack-mode-banner ${bannerClosing ? 'closing' : ''}`}>
            ¡Attack Mode!
          </div>
        )}

        {menuCircular.visible && (
          <>
            <div className="menu-circular-overlay" onClick={() => cerrarMenuCircular()} />
            <div
              className="menu-circular-container"
              style={{
                top: `${menuCircular.y}px`,
                left: `${menuCircular.x}px`,
              }}
            >
              <div
                className={`menu-item menu-item-1 ${menuCircular.closing ? 'closing' : ''}`}
                onClick={() => handleMenuOpcion('Inventario')}
              >
                Inventario
              </div>
              <div
                className={`menu-item menu-item-2 ${menuCircular.closing ? 'closing' : ''}`}
                onClick={() => handleMenuOpcion('Armas')}
              >
                Armas
              </div>
              <div
                className={`menu-item menu-item-3 ${menuCircular.closing ? 'closing' : ''}`}
                onClick={() => handleMenuOpcion('Hechizos')}
              >
                Hechizos
              </div>
            </div>
          </>
        )}

        {personajesEnTablero.map((p) => {

          const isDead = p.hp <= 0;
          const ondaInfo = !isDead && ondasIds.find(o => o.id === p.id);
          const isEnRango = !!ondaInfo;

          return (
            <Draggable
              key={p.id}
              bounds="parent"
              defaultPosition={{ x: p.pos_x, y: p.pos_y }}
              onStart={() => onStartDrag(p.id)}
              onStop={(e, data) => onStopDrag(e, data, p.id)}
              disabled={isDead}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (isDead) return;
                  if (modoSeleccionMultiple) return;

                  if (modoAtaque) {
                    manejarClickPersonajeEnAtaque(p.id);
                  } else {
                    seleccionarPersonaje(p.id);
                  }
                }}

                onContextMenu={(e) => {
                  e.stopPropagation();
                  if (isDead) return;
                  if (modoAtaque) {
                    e.preventDefault();
                    return;
                  }
                  manejarClickDerechoPersonaje(e, p);
                }}
                className={`
                  personaje-token
                  ${p.id === selectedPersonajeId ? "seleccionado" : ""}
                  ${p.id === objetivoPersonajeId && modoAtaque ? "objetivo" : ""}
                  ${seleccionMultipleIds.includes(p.id) && modoSeleccionMultiple ? "multiple" : ""}
                  ${modoSeleccionMultiple ? "no-cursor" : ""}
                  ${isDead ? "dead" : ""}
                `}
              >
                <PersonajeCanvas personaje={p} />

                {p.id === selectedPersonajeId && attackerPulseKey && (
                  <span
                    key={attackerPulseKey}
                    className="attacker-pulse-effect"
                  />
                )}

                {isEnRango && (
                  <span
                    key={ondaInfo.timestamp}
                    className="onda-efecto"
                  />
                )}
              </div>
            </Draggable>
          );
        })}
      </div>

      {/* --- PANEL DERECHO --- */}
      <div className="panel-derecha">
        {modoSeleccionMultiple ? (
          <>
            <h3 className="info-titulo">
              Selección Múltiple
            </h3>
            {personajesMultiple.map((p) => (
              <div key={p.id} className="info-multiple">
                <p>{p.nombre}</p>
                <p>
                  <strong>Posición:</strong> ({p.pos_x}, {p.pos_y})
                </p>
              </div>
            ))}
          </>
        ) : (
          <>
            {selectedPersonajeId && (
              <>
                <h3 className="info-titulo">
                  Atacante
                </h3>
                <InfoPersonaje p={atacante} />
              </>
            )}
            {modoAtaque && objetivoPersonajeId && (
              <>
                <h3 className="info-titulo">
                  Objetivo
                </h3>
                <InfoPersonaje p={objetivo} />
              </>
            )}
            {modoAtaque && distancia !== null && (
                <div className="info-personaje" style={{marginTop: 10, backgroundColor: 'rgba(255,255,200,0.3)'}}>
                    <p><strong>Distancia:</strong> {distancia}px</p>
                </div>
            )}
          </>
        )}
      </div>

      {/* --- ¡NUEVO MODAL PARA CAMBIAR MAPA! --- */}
      {/* Usamos las clases de DaisyUI para el modal */}
      {isMapModalOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box" style={{backgroundColor: '#f5f0e6', border: '3px solid #6b4c1d'}}>
            <h3 className="font-bold text-lg" style={{fontFamily: "'Cinzel Decorative', cursive", color: '#3e2d0a'}}>
              Seleccionar Escenario
            </h3>

            <div className="map-grid-container">
              {MAP_LIST.map(map => (
                <div
                  key={map.path}
                  // Aplicamos la clase 'active' si es el mapa actual
                  className={`map-thumbnail ${currentMap === map.path ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentMap(map.path); // Cambia el mapa
                    setIsMapModalOpen(false); // Cierra el modal
                  }}
                >
                  <img src={map.path} alt={map.name} />
                  <span>{map.name}</span>
                </div>
              ))}
            </div>

            <div className="modal-action">
              <button className="reset-button" onClick={() => setIsMapModalOpen(false)}>Cerrar</button>
            </div>
          </div>
          {/* Cierra el modal si se pincha fuera */}
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setIsMapModalOpen(false)}>close</button>
          </form>
        </dialog>
      )}

    </div>
  );
}

export default Tablero;
