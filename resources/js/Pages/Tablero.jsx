import React, { useEffect, useState } from "react";
import Draggable from "react-draggable";
import { Link } from '@inertiajs/react';

// Tus archivos separados
import InfoPersonaje from './InfoPersonaje';
import { calcularDistancia, calcularOndas as calcularOndasUtil } from '../utils/logicaTablero';
import { personajeService } from '../services/personajeService';
// --- ¡AQUÍ ESTÁ EL NUEVO COMPONENTE! ---
import PersonajeCanvas from './PersonajeCanvas';

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

  useEffect(() => {
    async function fetchPersonajes() {
      const data = await personajeService.getAll();
      setPersonajes(data);
    }
    fetchPersonajes();
  }, []);

  const agregarAPersonajeEnTablero = (personaje) => {
    if (!personajesEnTablero.find((p) => p.id === personaje.id)) {
      setPersonajesEnTablero([...personajesEnTablero, personaje]);
    }
  };

  const calcularOndas = (atacanteId, posX, posY) => {
    const idsEnRango = calcularOndasUtil(personajesEnTablero, atacanteId, posX, posY);
    setOndasIds(idsEnRango);
  };

  const onStartDrag = (personajeId) => {
    setPersonajeEnMovimientoId(personajeId);
    setOndasIds([]);
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

    calcularOndas(personajeId, posXRedondeada, posYRedondeada);
  };

  useEffect(() => {
    if (modoAtaque && selectedPersonajeId && objetivoPersonajeId) {
      const atacante = personajesEnTablero.find(p => p.id === selectedPersonajeId);
      const objetivo = personajesEnTablero.find(p => p.id === objetivoPersonajeId);
      const dist = calcularDistancia(atacante, objetivo);
      setDistancia(dist.toFixed(2));
    }
  }, [personajesEnTablero, modoAtaque, selectedPersonajeId, objetivoPersonajeId]);

  const toggleModoAtaque = () => {
    if (!selectedPersonajeId) {
      alert("Debes seleccionar un personaje para activar el modo ataque.");
      return;
    }
    setModoAtaque((v) => {
      if (v) {
        setDistancia(null);
        setObjetivoPersonajeId(null);
      }
      return !v;
    });
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
        const dist = calcularDistancia(atacante, objetivo);
        setDistancia(dist.toFixed(2));
      }
    } else if (!modoSeleccionMultiple) {
      setSelectedPersonajeId(personajeId);
      setDistancia(null);
      setObjetivoPersonajeId(null);
    }
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
  };

  const manejarClickDerechoPersonaje = (e, personajeId) => {
    e.preventDefault();
    if (!modoSeleccionMultiple) {
      setModoSeleccionMultiple(true);
      setSeleccionMultipleIds([personajeId]);
      setSelectedPersonajeId(null);
      setObjetivoPersonajeId(null);
      setDistancia(null);
      setModoAtaque(false);
      setOndasIds([]);
    } else {
      setSeleccionMultipleIds((prev) =>
        prev.includes(personajeId)
          ? prev.filter((id) => id !== personajeId)
          : [...prev, personajeId]
      );
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
  };

  const atacante = personajesEnTablero.find((p) => p.id === selectedPersonajeId);
  const objetivo = personajesEnTablero.find((p) => p.id === objetivoPersonajeId);
  const personajesMultiple = personajesEnTablero.filter((p) => seleccionMultipleIds.includes(p.id));

  return (
    <div
      className="tablero-wrapper"
      style={{ userSelect: modoSeleccionMultiple ? "none" : "auto" }}
    >
      <div className="panel-izquierda">
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
          <ul className="lista-personajes">
            {personajes.map((p) => (
              <li key={p.id}>
                {p.nombre}{" "}
                <button
                  className="agregar-btn text-xl"
                  onClick={() => agregarAPersonajeEnTablero(p)}
                >
                  +
                </button>
              </li>
            ))}
          </ul>
        </div>

        <h3 className="lista-titulo" style={{ marginTop: 20 }}>
          Personajes en el tablero
        </h3>
        <div className="lista-scroll">
          <ul className="lista-tablero">
            {personajesEnTablero.map((p) => (
              <li
                key={p.id}
                className={`
                  personaje-lista-item
                  ${modoAtaque && p.id === objetivoPersonajeId ? "objetivo" : ""}
                  ${p.id === selectedPersonajeId ? "seleccionado" : ""}
                  ${ondasIds.includes(p.id) ? "en-onda" : ""}
                `}
                onClick={() => manejarClickListaPersonaje(p.id)}
              >
                <strong>{p.nombre}</strong> - Pos: ({p.pos_x}, {p.pos_y})
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={toggleModoAtaque}
          disabled={modoSeleccionMultiple || !selectedPersonajeId}
          className={`atacar-btn ${modoAtaque ? "modo-ataque-activo" : ""}`}
        >
          {modoAtaque ? "Salir de Ataque" : "Atacar"}
        </button>
      </div>

      <div
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
        {personajesEnTablero.map((p) => (
          <Draggable
            key={p.id}
            bounds="parent"
            defaultPosition={{ x: p.pos_x, y: p.pos_y }}
            onStart={() => onStartDrag(p.id)}
            onStop={(e, data) => onStopDrag(e, data, p.id)}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (modoSeleccionMultiple) return;
                if (modoAtaque) {
                  manejarClickPersonajeEnAtaque(p.id);
                } else {
                  seleccionarPersonaje(p.id);
                }
              }}
              onContextMenu={(e) => manejarClickDerechoPersonaje(e, p.id)}
              className={`
                personaje-token
                ${p.id === selectedPersonajeId ? "seleccionado" : ""}
                ${p.id === objetivoPersonajeId && modoAtaque ? "objetivo" : ""}
                ${seleccionMultipleIds.includes(p.id) && modoSeleccionMultiple ? "multiple" : ""}
                ${modoSeleccionMultiple ? "no-cursor" : ""}
              `}
            >
              {/* --- ¡AQUÍ ESTÁ EL CAMBIO! --- */}
              {/* Ya no mostramos el nombre, sino el canvas */}
              <PersonajeCanvas personaje={p} />

              {ondasIds.includes(p.id) && (
                <span className="onda-efecto" />
              )}
            </div>
          </Draggable>
        ))}
      </div>

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
          </>
        )}
      </div>
    </div>
  );
}

export default Tablero;
