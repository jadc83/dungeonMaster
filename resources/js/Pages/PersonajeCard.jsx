import React, { useState } from 'react';

/**
 * Este es el nuevo componente para la tarjeta de la lista izquierda.
 * Gestiona su propio estado de pestañas.
 */
export default function PersonajeCard({
  p,
  isSelected,
  isObjetivo,
  isDead,
  onClick,
  onStatChange,
  onResucitar
}) {

  // Estado interno para saber qué pestaña está activa
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'info', 'spells'

  // --- Cálculos de Stats (movidos desde Tablero.jsx) ---
  const hpMax = p.hp_maximo || 10;
  const mpMax = p.mp_maximo || 10;
  const corduraMax = p.cordura_maxima || 99;
  const hpPercent = (p.hp / hpMax) * 100;
  const mpPercent = (p.mp / mpMax) * 100;
  const corduraPercent = (p.cordura / corduraMax) * 100;
  // --------------------------------------------------

  // Evita que el clic en la pestaña seleccione al personaje
  const handleTabClick = (e, tabName) => {
    e.stopPropagation();
    setActiveTab(tabName);
  };

  return (
    <li
      className={`
        pj-card
        ${isObjetivo ? "objetivo" : ""}
        ${isSelected ? "seleccionado" : ""}
        ${isDead ? "dead" : ""}
      `}
      onClick={onClick} // El clic en la tarjeta sigue seleccionando
    >
      {/* Overlay de Muerte (con botón) */}
      {isDead && (
        <div className="dead-container">
          <span className="dead-text">MUERTO</span>
          <button
            className="resucitar-btn"
            onClick={(e) => onResucitar(e, p.id)}
          >
            Resucitar
          </button>
        </div>
      )}

      {/* Avatar (siempre visible) */}
      <img
        src={p.avatar_url || '/token.png'}
        alt={p.nombre}
        className="pj-card-avatar"
      />

      {/* Contenedor principal (Pestañas + Contenido) */}
      <div className="pj-card-main-content">

        {/* 1. Las Pestañas (Tabs) */}
        <div className="pj-card-tabs">
          <button
            className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={(e) => handleTabClick(e, 'stats')}
            disabled={isDead}
          >
            Stats
          </button>
          <button
            className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
            onClick={(e) => handleTabClick(e, 'info')}
            disabled={isDead}
          >
            Armas
          </button>
          <button
            className={`tab-button ${activeTab === 'spells' ? 'active' : ''}`}
            onClick={(e) => handleTabClick(e, 'spells')}
            disabled={isDead}
          >
            Hechizos
          </button>
        </div>

        {/* 2. El Contenido (Condicional) */}
        <div className="pj-card-tab-content">

          {/* --- Pestaña 1: STATS --- */}
          {activeTab === 'stats' && (
            <div className="pj-card-stats">
              {/* Barra HP */}
              <div className="stat-row">
                <button className="stat-button" onClick={(e) => onStatChange(e, p.id, 'hp', -1)} disabled={p.hp <= 0}>-</button>
                <div className="stat-bar-bg">
                  <div className="stat-bar-fill hp" style={{ width: `${hpPercent}%` }}></div>
                  <span className="stat-bar-text">HP: {p.hp}/{hpMax}</span>
                </div>
                <button className="stat-button" onClick={(e) => onStatChange(e, p.id, 'hp', 1)} disabled={isDead || p.hp >= hpMax}>+</button>
              </div>
              {/* Barra MP */}
              <div className="stat-row">
                  <button className="stat-button" onClick={(e) => onStatChange(e, p.id, 'mp', -1)} disabled={isDead || p.mp <= 0}>-</button>
                <div className="stat-bar-bg">
                  <div className="stat-bar-fill mp" style={{ width: `${mpPercent}%` }}></div>
                  <span className="stat-bar-text">MP: {p.mp}/{mpMax}</span>
                </div>
                <button className="stat-button" onClick={(e) => onStatChange(e, p.id, 'mp', 1)} disabled={isDead || p.mp >= mpMax}>+</button>
              </div>
              {/* Barra Cordura */}
              <div className="stat-row">
                <button className="stat-button" onClick={(e) => onStatChange(e, p.id, 'cordura', -1)} disabled={isDead || p.cordura <= 0}>-</button>
                <div className="stat-bar-bg">
                  <div className="stat-bar-fill cordura" style={{ width: `${corduraPercent}%` }}></div>
                  <span className="stat-bar-text">COR: {p.cordura}/{corduraMax}</span>
                </div>
                <button className="stat-button" onClick={(e) => onStatChange(e, p.id, 'cordura', 1)} disabled={isDead || p.cordura >= corduraMax}>+</button>
              </div>
            </div>
          )}

          {/* --- Pestaña 2: INFO (En blanco) --- */}
          {activeTab === 'info' && (
            <div className="pj-card-blank">
              <p>Arsenal del personaje...</p>
            </div>
          )}

          {/* --- Pestaña 3: HECHIZOS (En blanco) --- */}
          {activeTab === 'spells' && (
            <div className="pj-card-blank">
              <p>Hechizos conocidos...</p>
            </div>
          )}
        </div>

      </div>
    </li>
  );
}
