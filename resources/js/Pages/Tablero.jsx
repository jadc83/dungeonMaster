import React from "react";
import Draggable from "react-draggable";
import { Link } from '@inertiajs/react';

// ¡RUTA DE IMPORTACIÓN CORREGIDA!
import { useTablero } from '../utils/useTablero';

// Importa los componentes de la vista
import InfoPersonaje from './InfoPersonaje';
import PersonajeCanvas from './PersonajeCanvas';
import PersonajeCard from './PersonajeCard';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

function Tablero() {

    // 1. Llama al Custom Hook para obtener todo el estado y la lógica
    const {
        // ESTADO y VALORES
        personajes, personajesEnTablero, selectedPersonajeId, objetivoPersonajeId,
        modoAtaque, distancia, modoSeleccionMultiple, seleccionMultipleIds,
        ondasIds, menuCircular, bannerVisible, bannerClosing, attackerPulseKey,
        isAvailableListOpen, availableMaps, currentMap, isMapModalOpen, isLoadingMaps,
        mapElements, selectedElement, isElementInspectModalOpen, activeElementOndas,
        activeTooltip, mapImageUrl, atacante, objetivo, personajesMultiple,
        availableObjects, filteredObjects, isObjectListOpen, isDraggingObject, draggedObject, objectSearchTerm,

        // REFS
        mapaRef,

        // SETTERS
        setModoSeleccionMultiple, setIsAvailableListOpen, setIsObjectListOpen, setObjectSearchTerm, setIsMapModalOpen,
        setCurrentMap, setIsElementInspectModalOpen,

        // HANDLERS
        onStartDrag, onStopDrag, agregarAPersonajeEnTablero, toggleModoAtaque,
        seleccionarPersonaje, manejarClickPersonajeEnAtaque, manejarClickListaPersonaje,
        manejarClickTablero, manejarClickDerechoPersonaje, cerrarMenuCircular,
        abrirMenuCircular, handleMenuOpcion, handleStatChange, handleResucitar,
        handleEjecutarAtaque, handleElementMouseEnter, handleElementMouseLeave,
        handleCharacterMouseEnter,
        handleCharacterMouseLeave,
        manejarClickElementoMapa,
        handleInspeccionar, handleRecoger, handleObjectDragStart, handleObjectDragEnd, handleMapDropObject, isObject
    } = useTablero();

    return (
        // <AuthenticatedLayout>
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
                            <div className="flex gap-2">
                                <Link
                                    href="/personajes/crear"
                                    className="reset-button"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Crear Personaje
                                </Link>
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
                                style={{flexGrow: 1}}
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
                        <div
                            className={`lista-titulo-desplegable ${isAvailableListOpen ? 'abierto' : ''}`}
                            onClick={() => setIsAvailableListOpen(!isAvailableListOpen)}
                        >
                            <div className="titulo-desplegable-contenido">
                                <span className="texto-titulo">⚔️ Personajes Disponibles</span>
                                <span className={`icono-desplegable ${isAvailableListOpen ? 'abierto' : ''}`}>
                                    ▶
                                </span>
                            </div>
                        </div>

                        <div className={`contenido-desplegable ${isAvailableListOpen ? 'abierto' : 'cerrado'}`}>
                            {isAvailableListOpen && (
                                <div className="lista-scroll-mejorada" style={{marginTop: '10px'}}>
                                    {personajes
                                        .filter(p => !personajesEnTablero.find(pj => pj.id === p.id))
                                        .map((p) => (
                                            <div key={p.id} className="personaje-item-mejorado flex justify-between items-center">
                                                <div className="personaje-info">
                                                    <div className="personaje-nombre">{p.nombre}</div>
                                                    <div className="personaje-profesion">{p.profesion}</div>
                                                </div>
                                                <button
                                                    className="agregar-btn-mejorado"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        agregarAPersonajeEnTablero(p);
                                                    }}
                                                    aria-label={`Añadir a ${p.nombre}`}
                                                    title="Agregar personaje al tablero"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        ))}

                                    {personajes.filter(p => !personajesEnTablero.find(pj => pj.id === p.id)).length === 0 && (
                                        <div className="lista-vacia-mensaje">
                                            No hay más personajes disponibles.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* --- FIN DE LA LISTA 1 --- */}

                        {/* --- LISTA 2: OBJETOS DISPONIBLES (COLAPSABLE) --- */}
                        <div
                            className={`lista-titulo-desplegable ${isObjectListOpen ? 'abierto' : ''}`}
                            onClick={() => setIsObjectListOpen(!isObjectListOpen)}
                        >
                            <div className="titulo-desplegable-contenido">
                                <span className="texto-titulo">📦 Objetos Disponibles</span>
                                <span className={`icono-desplegable ${isObjectListOpen ? 'abierto' : ''}`}>
                                    ▶
                                </span>
                            </div>
                        </div>

                        <div className={`contenido-desplegable ${isObjectListOpen ? 'abierto' : 'cerrado'}`}>
                            {isObjectListOpen && (
                                <div className="lista-scroll-mejorada" style={{marginTop: '10px'}}>
                                    {/* Buscador */}
                                    <div className="object-search-container" style={{ marginBottom: '8px' }}>
                                        <input
                                            type="text"
                                            placeholder="Buscar objeto..."
                                            value={objectSearchTerm}
                                            onChange={(e) => setObjectSearchTerm(e.target.value)}
                                            className="object-search-input"
                                            style={{
                                                width: '100%',
                                                padding: '6px 12px',
                                                fontSize: '12px',
                                                border: '1px solid #8a6d3e',
                                                borderRadius: '4px',
                                                backgroundColor: '#ffffff',
                                                color: '#2c1810',
                                                outline: 'none',
                                                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
                                                fontFamily: 'inherit'
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>

                                    {/* Lista de objetos */}
                                    {filteredObjects.map((obj) => (
                                        <div
                                            key={obj.id}
                                            className="objeto-item-mejorado flex justify-between items-center"
                                            draggable
                                            onDragStart={() => handleObjectDragStart(obj)}
                                            onDragEnd={handleObjectDragEnd}
                                            onMouseEnter={(e) => {
                                                const rect = e.target.getBoundingClientRect();
                                                // Simular el tooltip personalizado (se implementará después)
                                            }}
                                            onMouseLeave={() => {
                                                // Ocultar tooltip (se implementará después)
                                            }}
                                        >
                                            <div className="objeto-info flex items-center">
                                                <div className="objeto-icono" style={{ marginRight: '8px', color: '#8a6d3e' }}>
                                                    📦
                                                </div>
                                                <div>
                                                    <div className="objeto-nombre">{obj.denominacion}</div>
                                                    {obj.valor && (
                                                        <div className="objeto-valor">
                                                            Valor: {obj.valor}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="objeto-drag-hint">
                                                ⋮⋮
                                            </div>
                                        </div>
                                    ))}

                                    {filteredObjects.length === 0 && (
                                        <div className="lista-vacia-mensaje">
                                            {objectSearchTerm ? 'No se encontraron objetos.' : 'No hay objetos disponibles.'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* --- FIN DE LA LISTA 2 --- */}

                    </div>
                </div> {/* --- FIN DEL PANEL IZQUIERDO --- */}


                {/* --- INICIO DEL MAPA --- */}
                <div
                    ref={mapaRef}
                    className="tablero-mapa"
                    onClick={manejarClickTablero}
                    onContextMenu={manejarClickTablero}
                    onDrop={handleMapDropObject}
                    onDragOver={(e) => e.preventDefault()} // Necesario para permitir el drop
                    style={{
                        backgroundImage: `url('${mapImageUrl}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center center',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        backgroundBlendMode: 'darken',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >

                    {/* --- Renderizar Elementos del Mapa (Objetos/Eventos) --- */}
                    {mapElements.map((element) => {
                        const icon = isObject(element) ? '📦' : '📜';
                        const typeClass = isObject(element) ? 'element-object' : 'element-event';
                        const isElementActive = activeElementOndas.hasOwnProperty(element.id);
                        const isElementSelected = selectedElement && selectedElement.id === element.id;

                        return (
                            <div
                                key={element.id}
                                className={`map-element-token ${typeClass} ${isElementSelected ? 'seleccionado-elemento' : ''} ${isElementActive ? 'element-active-glow' : ''}`}
                                style={{
                                    transform: `translate(${element.pos_x}px, ${element.pos_y}px)`,
                                    position: 'absolute',
                                    cursor: isObject(element) && selectedPersonajeId && !modoAtaque ? 'pointer' : 'help',
                                    zIndex: 10,
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: isObject(element) ? 'rgba(56, 189, 248, 0.7)' : 'rgba(255, 193, 7, 0.7)',
                                    border: isElementActive || isElementSelected ? '4px solid #fff' : '2px solid white',
                                    boxShadow: !isElementActive && isElementSelected
                                            ? '0 0 15px 4px rgba(191, 146, 72, 0.9)'
                                            : isElementActive ? 'none' : '0 0 8px rgba(0,0,0,0.5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s ease-out'
                                }}
                                onClick={(e) => manejarClickElementoMapa(e, element)}
                                onMouseEnter={(e) => handleElementMouseEnter(e, element)}
                                onMouseLeave={handleElementMouseLeave}
                            >
                                <span style={{ fontSize: '1.2rem' }}>
                                    {icon}
                                </span>
                            </div>
                        );
                    })}
                    {/* --- FIN Renderizado Elementos del Mapa --- */}

                    {/* --- TOOLTIP PERSONALIZADO (Ajustado para Personajes/Elementos) --- */}
                    {activeTooltip.visible && activeTooltip.details && (
                        <div
                            style={{
                                position: 'absolute',
                                top: `${activeTooltip.y}px`,
                                left: `${activeTooltip.x}px`,
                                zIndex: 100,

                                // ESTILOS COMPACTOS Y OSCUROS
                                backgroundColor: 'rgba(20, 20, 20, 0.98)',
                                color: '#f5f0e6',
                                border: '2px solid #d4af37',
                                padding: '6px 8px', // Padding muy reducido
                                borderRadius: '4px',

                                // ESTILOS DE TAMAÑO DINÁMICO
                                width: activeTooltip.details.hp !== undefined ? '120px' : '250px',

                                pointerEvents: 'none',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.6)',
                                fontSize: '0.7rem', // Fuente muy pequeña
                                lineHeight: '1.2',
                                textAlign: 'left',
                                transition: 'opacity 0.2s ease-out'
                            }}
                        >
                            {/* Título: Nombre del personaje/objeto */}
                            <div style={{
                                fontWeight: 'bold',
                                fontSize: '0.8rem',
                                color: '#d4af37',
                                marginBottom: '4px',
                                textAlign: 'center'
                            }}>
                                {activeTooltip.details.icon} {activeTooltip.name}
                            </div>

                            {/* LÓGICA CONDICIONAL: Mostrar Stats si es un Personaje */}
                            {activeTooltip.details.hp !== undefined ? (
                                <div style={{
                                    marginTop: '2px',
                                    paddingTop: '2px',
                                    borderTop: '1px solid #444',
                                    fontSize: '0.7rem'
                                }}>
                                    <p><strong>HP:</strong> {activeTooltip.details.hp} / {activeTooltip.details.hp_maximo}</p>
                                    <p><strong>MP:</strong> {activeTooltip.details.mp} / {activeTooltip.details.mp_maximo}</p>
                                    {/* ¡CORREGIDO! Usando COR */}
                                    <p><strong>COR:</strong> {activeTooltip.details.cordura} / {activeTooltip.details.cordura_maxima}</p>
                                </div>
                            ) : (
                                // Lógica existente para Objetos/Eventos
                                <>
                                    <div style={{color: '#ccc', marginBottom: '4px'}}>
                                        Tipo: {activeTooltip.type}
                                    </div>
                                    <p style={{marginBottom: '3px'}}>
                                        <strong>Pos:</strong> ({activeTooltip.details.pos_x}, {activeTooltip.details.pos_y})
                                    </p>
                                    {activeTooltip.details.valor && (
                                        <p style={{marginBottom: '3px'}}>
                                            <strong>Val:</strong> {activeTooltip.details.valor}
                                        </p>
                                    )}
                                    <p>
                                        <strong>Rango:</strong> {activeTooltip.details.rango}
                                    </p>
                                    <div style={{marginTop: '6px', paddingTop: '4px', borderTop: '1px solid #444', color: '#ccc', maxHeight: '50px', overflowY: 'hidden'}}>
                                        {activeTooltip.details.descripcion}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    {/* --- FIN TOOLTIP PERSONALIZADO --- */}


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
                                position={{ x: p.pos_x, y: p.pos_y }}
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

                                    // --- EVENTOS PARA EL TOOLTIP DE PERSONAJE ---
                                    onMouseEnter={(e) => isDead || modoAtaque ? null : handleCharacterMouseEnter(e, p)}
                                    onMouseLeave={handleCharacterMouseLeave}
                                    // --------------------------------------------

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
                            {/* --- FICHA COMPLETA DEL PERSONAJE SELECCIONADO --- */}
                            {selectedPersonajeId && atacante && (
                                <div className="personaje-ficha-completa">
                                    <PersonajeCard
                                        p={atacante}
                                        isDead={atacante.hp <= 0}
                                        isSelected={true}
                                        isObjetivo={modoAtaque && atacante.id === objetivoPersonajeId}
                                        onClick={() => {}} // No hacer nada al hacer click en la ficha del panel derecho
                                        onStatChange={handleStatChange}
                                        onResucitar={handleResucitar}
                                    />
                                </div>
                            )}

                            {/* --- INFORMACIÓN DE ATAQUE (SOLO EN MODO ATAQUE) --- */}
                            {modoAtaque && objetivoPersonajeId && (
                                <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '2px solid #8a6d3e' }}>
                                    <h3 className="info-titulo">
                                        Objetivo
                                    </h3>
                                    <InfoPersonaje p={objetivo} />

                                    {distancia !== null && (
                                        <div className="info-personaje" style={{marginTop: 10, backgroundColor: 'rgba(255,255,200,0.3)'}}>
                                            <p><strong>Distancia:</strong> {distancia}px</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* --- NUEVO: INFORMACIÓN DEL ELEMENTO SELECCIONADO --- */}
                            {selectedElement && selectedElement.elementable && (
                                <div className="info-elemento-seleccionado" style={{marginTop: 20}}>
                                    <h3 className="info-titulo">
                                        Elemento Seleccionado
                                    </h3>
                                    <div className="info-personaje">
                                        <p className="nombre" style={{marginBottom: '5px'}}>
                                            {selectedElement.elementable.denominacion || 'N/A'} {isObject(selectedElement) ? '📦' : '📜'}
                                        </p>
                                        <p style={{marginBottom: '10px'}}>
                                            <strong>Tipo:</strong> {selectedElement.elementable_type.split('\\').pop()}
                                        </p>
                                        <p style={{marginBottom: '10px'}}>
                                            <strong>Valor:</strong> {selectedElement.elementable.valor || 'N/A'}
                                        </p>

                                        <div className="flex gap-2 mt-3" style={{marginTop: '12px', display: 'flex', gap: '8px'}}>
                                            {/* Botón Inspeccionar */}
                                            <button
                                                onClick={handleInspeccionar}
                                                className="reset-button"
                                                style={{
                                                    flexGrow: 1,
                                                    backgroundColor: '#8a6d3e',
                                                    color: '#f5f0e6',
                                                    padding: '8px 15px',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                Inspeccionar
                                            </button>
                                            {/* Botón Recoger (Solo si es un Objeto) */}
                                            {isObject(selectedElement) && (
                                                <button
                                                    onClick={handleRecoger}
                                                    className="reset-button"
                                                    style={{
                                                        flexGrow: 1,
                                                        backgroundColor: '#27ae60',
                                                        color: 'white',
                                                        padding: '8px 15px',
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    Recoger
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* --- FIN INFORMACIÓN DEL ELEMENTO SELECCIONADO --- */}
                        </>
                    )}
                </div>

                {/* --- MODAL PARA CAMBIAR MAPA --- */}
                {isMapModalOpen && (
                    <dialog className="modal modal-open">
                        <div className="modal-box" style={{backgroundColor: '#f5f0e6', border: '3px solid #6b4c1d'}}>
                            <h3 className="font-bold text-lg" style={{fontFamily: "'Cinzel Decorative', cursive", color: '#3e2d0a'}}>
                                Seleccionar Escenario
                            </h3>

                            {isLoadingMaps ? (
                                <p>Cargando mapas...</p>
                            ) : availableMaps.length === 0 ? (
                                <p>No se encontraron mapas en la base de datos.</p>
                            ) : (
                                <div className="map-grid-container">
                                    {availableMaps.map(map => (
                                        <div
                                            key={map.id}
                                            className={`map-thumbnail ${currentMap && currentMap.id === map.id ? 'active' : ''}`}
                                            onClick={() => {
                                                setCurrentMap(map);
                                                setIsMapModalOpen(false);
                                            }}
                                        >
                                            <img src={map.imagen_url} alt={map.nombre} />
                                            <span>{map.nombre} (ID: {map.id})</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="modal-action">
                                <button className="reset-button" onClick={() => setIsMapModalOpen(false)}>Cerrar</button>
                            </div>
                        </div>
                        <form method="dialog" className="modal-backdrop">
                            <button onClick={() => setIsMapModalOpen(false)}>close</button>
                        </form>
                    </dialog>
                )}

                {/* --- NUEVO MODAL: INSPECCIONAR ELEMENTO --- */}
                {isElementInspectModalOpen && selectedElement && selectedElement.elementable && (
                    <dialog className="modal modal-open">
                        <div className="modal-box" style={{backgroundColor: '#f5f0e6', border: '3px solid #6b4c1d'}}>
                            <h3 className="font-bold text-lg" style={{fontFamily: "'Cinzel Decorative', cursive", color: '#3e2d0a'}}>
                                Inspeccionar {isObject(selectedElement) ? 'Objeto' : 'Evento'}
                            </h3>
                            <h4 style={{marginTop: 10, fontWeight: 'bold', fontSize: '1.1rem', color: '#3e2d0a'}}>{selectedElement.elementable.denominacion || 'Elemento Desconocido'}</h4>

                            <div style={{maxHeight: '400px', overflowY: 'auto', marginTop: '15px'}}>
                                <p style={{marginBottom: 10, color: '#3e2d0a'}}>
                                    <strong>Valor:</strong> {selectedElement.elementable.valor || 'N/A'}
                                </p>
                                <p style={{color: '#3e2d0a'}}>
                                    <strong>Descripción:</strong>
                                </p>
                                <div style={{backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: '10px', borderRadius: '4px', fontStyle: 'italic', color: '#3e2d0a', marginTop: '10px', border: '1px dashed #6b4c1d'}}>
                                    {selectedElement.elementable.descripcion || selectedElement.elementable.notas_master || 'No hay una descripción detallada disponible.'}
                                </div>
                            </div>

                            <div className="modal-action">
                                <button className="reset-button" onClick={() => setIsElementInspectModalOpen(false)}>Cerrar</button>
                            </div>
                        </div>
                        <form method="dialog" className="modal-backdrop">
                            <button onClick={() => setIsElementInspectModalOpen(false)}>close</button>
                        </form>
                    </dialog>
                )}
                {/* --- FIN MODAL INSPECCIONAR ELEMENTO --- */}


            </div>
        // </AuthenticatedLayout>
    );
}

export default Tablero;
