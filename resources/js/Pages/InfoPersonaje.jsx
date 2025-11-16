import React from 'react';

// Es un componente que solo recibe el personaje (p) como prop
export default function InfoPersonaje({ p }) {
  if (!p) return <p>Personaje no encontrado.</p>;

  return (
    <div className="info-personaje">
      <p className="nombre">{p.nombre}</p>
      <p><strong>Nacionalidad:</strong> {p.nacionalidad}</p>
      <p><strong>Residencia:</strong> {p.residencia}</p>
      <p><strong>Profesión:</strong> {p.profesion}</p>
      <p><strong>Edad:</strong> {p.edad}</p>
      <p><strong>Género:</strong> {p.genero}</p>
      <p><strong>Cordura:</strong> {p.cordura}</p>
      <p><strong>Locura Temporal:</strong> {p.locura_temporal ? "Sí" : "No"}</p>
      <p><strong>Locura Indefinida:</strong> {p.locura_indefinida ? "Sí" : "No"}</p>
      <p><strong>Posición:</strong> ({p.pos_x}, {p.pos_y})</p>
    </div>
  );
}
