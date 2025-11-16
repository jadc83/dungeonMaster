import React, { useEffect, useState, useRef } from "react";
import Draggable from "react-draggable";
import { Link } from '@inertiajs/react';

// Tus archivos separados
import InfoPersonaje from './InfoPersonaje';
import { calcularDistancia, calcularOndas as calcularOndasUtil } from '../utils/logicaTablero';
import { personajeService } from '../services/personajeService';
import PersonajeCanvas from './PersonajeCanvas';

// Constantes del Token
const TOKEN_CENTER_OFFSET = 35;

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

  const mapaRef = useRef(null);

  // --- ¡BANDERA PARA EVITAR DOBLE CLIC! ---
  const attackFlag = useRef(false);

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


  // --- ¡LÓGICA DE ONDAS CORREGIDA! ---
  // Las ondas ahora dependen del ATACANTE seleccionado
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
  }, [selectedPersonajeId, personajesEnTablero]); // Se actualiza si el atacante o las posiciones cambian


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
    // Ya no calculamos ondas aquí
  };

  const agregarAPersonajeEnTablero = (personaje) => {
    if (!personajesEnTablero.find((p) => p.id === personaje.id)) {
      setPersonajesEnTablero([...personajesEnTablero, personaje]);
    }
  };

  const calcularOndas = () => {}; // No se usa

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

  const resetearPosiciones = async () => {
    const pin = prompt("Introduce el pin para resetear posiciones:");
    if (pin !== "1234") {
      alert("Pin incorrecto");
      return;
    }
    const nuevoEstado = personajesEnTablero.map((p) => ({
      ...p,
      pos_x: 0,
      pos_y: 0,
    }));
    setPersonajesEnTablero(nuevoEstado);
    try {
      await personajeService.resetAllPosiciones(nuevoEstado);
    } catch (error) {
      console.error("Error actualizando posición en DB", error);
    }
    setOndasIds([]);
    cerrarMenuCircular();
  };

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

  // --- ¡LÓGICA DE ATAQUE DE PROXIMIDAD (CORREGIDA)! ---
  const handleAtaqueProximidad = (e, targetId) => {
    e.stopPropagation(); // Detiene el burbujeo

    // 1. Levantamos la bandera para que el clic del padre no se ejecute
    attackFlag.current = true;

    // 2. Comprobamos si estamos en modo ataque y tenemos un atacante
    if (!modoAtaque || !selectedPersonajeId) {
      alert("Debes estar en modo ataque para atacar.");
      return;
    }

    // 3. Ejecutamos el daño
    console.log(`Atacando (por proximidad) a: ${targetId}`);
    handleStatChange(null, targetId, 'hp', -1); // 'null' porque no necesitamos el evento
  };


  return (
    <div
      className="tablero-wrapper"
      style={{ userSelect: modoSeleccionMultiple ? "none" : "auto" }}
    >
      <div className="panel-izquierda">

        {/* --- LISTA 1: PERSONAJES DISPONIBLES (CON DAISYUI) --- */}
        <h3 className="lista-titulo">
          Lista de personajes
          <div>
            <Link
              href="/personajes/crear"
              className="reset-button"
              style={{ marginRight: '10px' }}
            >
              Crear Personaje
            </Link>
            <button
              onClick={resetearPosiciones}
              className="reset-button"
            >
              Resetear posiciones
            </button>
          </div>
        </h3>
        <div className="lista-scroll">
          <div className="flex flex-col gap-2">
            {personajes.map((p) => (
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
                  className="btn btn-primary btn-sm btn-circle"
                  onClick={() => agregarAPersonajeEnTablero(p)}
                  aria-label={`Añadir a ${p.nombre}`}
                  disabled={personajesEnTablero.find(pj => pj.id === p.id)}
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </div>
        {/* --- FIN DE LA LISTA 1 --- */}


        {/* --- LISTA 2: PERSONAJES EN JUEGO (¡CON BOTONES Y LÓGICA DE MUERTE!) --- */}
        <h3 className="lista-titulo" style={{ marginTop: 20 }}>
          Personajes en el tablero
        </h3>
        <div className="lista-scroll">
          <ul className="lista-tablero">
            {personajesEnTablero.map((p) => {

              const hpMax = p.hp_maximo || 10;
              const mpMax = p.mp_maximo || 10;
              const corduraMax = p.cordura_maxima || 99;

              const hpPercent = (p.hp / hpMax) * 100;
              const mpPercent = (p.mp / mpMax) * 100;
              const corduraPercent = (p.cordura / corduraMax) * 100;

              const isDead = p.hp <= 0;

              return (
                <li
                  key={p.id}
                  className={`
                    pj-card
                    ${modoAtaque && p.id === objetivoPersonajeId ? "objetivo" : ""}
                    ${p.id === selectedPersonajeId ? "seleccionado" : ""}
                    ${isDead ? "dead" : ""}
                  `}
                  onClick={() => !isDead && manejarClickListaPersonaje(p.id)}
                >
                  {isDead && (
                    <div className="dead-container">
                      <span className="dead-text">MUERTO</span>
                      <button
                        className="resucitar-btn"
                        onClick={(e) => handleResucitar(e, p.id)}
                      >
                        Resucitar
                      </button>
                    </div>
                  )}

                  <img
                    src={p.avatar_url || '/token.png'}
                    alt={p.nombre}
                    className="pj-card-avatar"
                  />
                  <div className="pj-card-stats">
                    <div className="stat-row">
                      <button
                        className="stat-button"
                        onClick={(e) => handleStatChange(e, p.id, 'hp', -1)}
                        disabled={p.hp <= 0}
                      >
                        -
                      </button>
                      <div className="stat-bar-bg">
                        <div
                          className="stat-bar-fill hp"
                          style={{ width: `${hpPercent}%` }}
                        ></div>
                        <span className="stat-bar-text">HP: {p.hp}/{hpMax}</span>
                      </div>
                      <button
                        className="stat-button"
                        onClick={(e) => handleStatChange(e, p.id, 'hp', 1)}
                        disabled={isDead || p.hp >= hpMax}
                      >
                        +
                      </button>
                    </div>
                    <div className="stat-row">
                      <button
                        className="stat-button"
                        onClick={(e) => handleStatChange(e, p.id, 'mp', -1)}
                        disabled={isDead || p.mp <= 0}
                      >
                        -
                      </button>
                      <div className="stat-bar-bg">
                        <div
                          className="stat-bar-fill mp"
                          style={{ width: `${mpPercent}%` }}
                        ></div>
                        <span className="stat-bar-text">MP: {p.mp}/{mpMax}</span>
                      </div>
                      <button
                        className="stat-button"
                        onClick={(e) => handleStatChange(e, p.id, 'mp', 1)}
                        disabled={isDead || p.mp >= mpMax}
                      >
                        +
                      </button>
                    </div>
                    <div className="stat-row">
                      <button
                        className="stat-button"
                        onClick={(e) => handleStatChange(e, p.id, 'cordura', -1)}
                        disabled={isDead || p.cordura <= 0}
                      >
                        -
                      </button>
                      <div className="stat-bar-bg">
                        <div
                          className="stat-bar-fill cordura"
                          style={{ width: `${corduraPercent}%` }}
                        ></div>
                        <span className="stat-bar-text">COR: {p.cordura}/{corduraMax}</span>
                      </div>
                      <button
                        className="stat-button"
                        onClick={(e) => handleStatChange(e, p.id, 'cordura', 1)}
                        disabled={isDead || p.cordura >= corduraMax}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        {/* --- FIN DE LA LISTA 2 --- */}

        <button
          onClick={toggleModoAtaque}
          disabled={modoSeleccionMultiple || !selectedPersonajeId}
          className={`atacar-btn ${modoAtaque ? "modo-ataque-activo" : ""}`}
        >
          {modoAtaque ? "Salir de Ataque" : "Atacar"}
        </button>

        {/* --- Botón de Proximidad ELIMINADO de aquí --- */}

      </div>

      <div
        ref={mapaRef}
        className="tablero-mapa"
        onClick={manejarClickTablero}
        onContextMenu={manejarClickTablero}
        style={{
          backgroundImage: "url('/mapa.jpg')",
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

                  // --- ¡LÓGICA DE CLIC CON BANDERA! ---
                  // 1. Revisar la bandera. Si es 'true', significa que el icono ⚔️
                  // ya se encargó de este clic, así que la reseteamos y no hacemos nada.
                  if (attackFlag.current === true) {
                    attackFlag.current = false; // Resetea la bandera
                    return;
                  }

                  // 2. Si la bandera es 'false', continuamos con la lógica normal
                  if (isDead) return;
                  if (modoSeleccionMultiple) return;

                  if (modoAtaque) {
                    // Si estamos en modo ataque, un clic SIEMPRE es para seleccionar objetivo
                    manejarClickPersonajeEnAtaque(p.id);
                  } else {
                    // Si no, es para seleccionar un atacante/personaje
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

                {/* --- ¡ICONO DE ATAQUE (VUELVE AQUÍ)! --- */}
                {modoAtaque && isEnRango && (
                  <div
                    className="attack-icon"
                    onClick={(e) => handleAtaqueProximidad(e, p.id)}
                    title="Atacar por proximidad"
                  >
                    ⚔️
                  </div>
                )}

                {/* Pulso del Atacante (cuando entra en modo ataque) */}
                {p.id === selectedPersonajeId && attackerPulseKey && (
                  <span
                    key={attackerPulseKey}
                    className="attacker-pulse-effect"
                  />
                )}

                {/* Onda de Rango (en los objetivos) */}
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

      <div className="panel-derecha">
        {/* ... (panel derecho) ... */}
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
    </div>
  );
}

export default Tablero;
