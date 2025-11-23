import React, { useState, useEffect } from 'react';
import { personajeService } from '../services/personajeService';

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
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'weapons', 'spells', 'inventory'

  // Estado para el inventario
  const [inventory, setInventory] = useState([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  // Estado para el tooltip del inventario
  const [inventoryTooltip, setInventoryTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    item: null
  });

  // --- Cálculos de Stats (movidos desde Tablero.jsx) ---
  const hpMax = p.hp_maximo || 10;
  const mpMax = p.mp_maximo || 10;
  const corduraMax = p.cordura_maxima || 99;
  const hpPercent = (p.hp / hpMax) * 100;
  const mpPercent = (p.mp / mpMax) * 100;
  const corduraPercent = (p.cordura / corduraMax) * 100;
  // --------------------------------------------------

  // Cargar inventario cuando se selecciona la pestaña de inventario
  useEffect(() => {
    if (activeTab === 'inventory' && !isLoadingInventory) {
      loadInventory();
    }
  }, [activeTab]);

  const loadInventory = async () => {
    setIsLoadingInventory(true);
    try {
      const personajeData = await personajeService.getPersonajeDetails(p.id, 'inventario');
      setInventory(personajeData.inventario || []);
    } catch (error) {
      console.error('Error al cargar inventario:', error);
      setInventory([]);
    } finally {
      setIsLoadingInventory(false);
    }
  };

  // Handlers para el tooltip del inventario
  const handleInventoryMouseEnter = (e, item) => {
    const rect = e.target.getBoundingClientRect();
    setInventoryTooltip({
      visible: true,
      x: rect.right + 10, // A la derecha del slot
      y: rect.top,
      item: item
    });
  };

  const handleInventoryMouseLeave = () => {
    setInventoryTooltip({
      visible: false,
      x: 0,
      y: 0,
      item: null
    });
  };

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
            className={`tab-button ${activeTab === 'weapons' ? 'active' : ''}`}
            onClick={(e) => handleTabClick(e, 'weapons')}
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
          <button
            className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={(e) => handleTabClick(e, 'inventory')}
            disabled={isDead}
          >
            Inventario
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

          {/* --- Pestaña 2: ARMAS --- */}
          {activeTab === 'weapons' && (
            <div className="pj-card-blank">
              <p>Arsenal del personaje...</p>
            </div>
          )}

          {/* --- Pestaña 3: HECHIZOS --- */}
          {activeTab === 'spells' && (
            <div className="pj-card-blank">
              <p>Hechizos conocidos...</p>
            </div>
          )}

          {/* --- Pestaña 4: INVENTARIO --- */}
          {activeTab === 'inventory' && (
            <div className="pj-card-inventory">
              {isLoadingInventory ? (
                <div className="loading-inventory">
                  <span>Cargando inventario...</span>
                </div>
              ) : inventory.length > 0 ? (
                <div className="inventory-grid">
                  {inventory.map((item, index) => (
                    <div
                      key={index}
                      className="inventory-slot"
                      onMouseEnter={(e) => handleInventoryMouseEnter(e, item)}
                      onMouseLeave={handleInventoryMouseLeave}
                    >
                      <div className="slot-content">
                        <div className="item-icon">
                          {item.denominacion ? item.denominacion.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="item-quantity">{item.pivot?.cantidad || 1}</div>
                        {item.pivot?.equipado && (
                          <div className="equipped-indicator">⚡</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {/* Rellenar slots vacíos para una cuadrícula uniforme */}
                  {Array.from({ length: Math.max(0, 12 - inventory.length) }).map((_, index) => (
                    <div key={`empty-${index}`} className="inventory-slot empty">
                      <div className="slot-content"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-inventory">
                  <div className="inventory-grid">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <div key={`empty-${index}`} className="inventory-slot empty">
                        <div className="slot-content"></div>
                      </div>
                    ))}
                  </div>
                  <div className="empty-message">Inventario vacío</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- TOOLTIP PERSONALIZADO PARA INVENTARIO --- */}
        {inventoryTooltip.visible && inventoryTooltip.item && (
          <div
            style={{
              position: 'fixed',
              top: `${inventoryTooltip.y}px`,
              left: `${inventoryTooltip.x}px`,
              zIndex: 1000,

              // ESTILOS COMPACTOS Y OSCUROS (copiados del tooltip del tablero)
              backgroundColor: 'rgba(20, 20, 20, 0.98)',
              color: '#f5f0e6',
              border: '2px solid #d4af37',
              padding: '6px 8px',
              borderRadius: '4px',
              width: '200px',

              pointerEvents: 'none',
              boxShadow: '0 4px 8px rgba(0,0,0,0.6)',
              fontSize: '0.7rem',
              lineHeight: '1.2',
              textAlign: 'left',
              transition: 'opacity 0.2s ease-out'
            }}
          >
            {/* Título: Nombre del objeto */}
            <div style={{
              fontWeight: 'bold',
              fontSize: '0.8rem',
              color: '#d4af37',
              marginBottom: '4px',
              textAlign: 'center'
            }}>
              {inventoryTooltip.item.denominacion || 'Objeto'}
            </div>

            {/* Información del objeto */}
            <div style={{
              marginTop: '2px',
              paddingTop: '2px',
              borderTop: '1px solid #444',
              fontSize: '0.7rem'
            }}>
              <p><strong>Cantidad:</strong> {inventoryTooltip.item.pivot?.cantidad || 1}</p>
              <p><strong>Estado:</strong> {inventoryTooltip.item.pivot?.equipado ? 'Equipado ⚡' : 'No equipado'}</p>
              {inventoryTooltip.item.valor && (
                <p><strong>Valor:</strong> {inventoryTooltip.item.valor}</p>
              )}
            </div>

            {inventoryTooltip.item.descripcion && (
              <div style={{
                marginTop: '6px',
                paddingTop: '4px',
                borderTop: '1px solid #444',
                color: '#ccc',
                maxHeight: '60px',
                overflowY: 'auto'
              }}>
                {inventoryTooltip.item.descripcion}
              </div>
            )}
          </div>
        )}
        {/* --- FIN TOOLTIP PERSONALIZADO --- */}

      </div>
    </li>
  );
}
