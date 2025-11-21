import React from 'react';

// Es un componente que solo recibe el personaje (p) como prop
export default function InfoPersonaje({ p }) {
  if (!p) return <p>Personaje no encontrado.</p>;

  return (
    <div className="info-personaje">
      <p className="nombre">{p.nombre}</p>
      <p><strong>Posición:</strong> ({p.pos_x}, {p.pos_y})</p>
    </div>
  );
}
