import React from 'react';
import { useForm, Link } from '@inertiajs/react';

export default function CrearPersonaje() {
  const { data, setData, post, processing, errors } = useForm({
    nombre: '',
    nacionalidad: 'Desconocida',
    residencia: 'Desconocida',
    profesion: 'Investigador',
    edad: 30,
    genero: 'No especificado',
    nombre_jugador: '',
    avatar_url: null, // <-- ¡AHORA ES 'null'!
  });

  // ¡ESTE 'handleChange' ES DIFERENTE!
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      // Si es un archivo, guardamos el objeto File
      setData(name, files[0]);
    } else {
      // Si es texto, guardamos el valor
      setData(name, value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 'post' es inteligente. Al ver un objeto File,
    // automáticamente enviará el formulario como 'multipart/form-data'
    post('/personajes');
  };

  return (
    <div className="crear-personaje-container">
      <h2 className="crear-personaje-titulo">Crear Investigador</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">

          {/* ... (Todos tus otros campos: nombre, nacionalidad, etc. se quedan igual) ... */}

          {/* --- CAMPO NOMBRE (Ocupa 2 columnas) --- */}
          <div className="form-grupo span-2">
            <label htmlFor="nombre" className="form-label">Nombre:</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={data.nombre}
              onChange={handleChange}
              className="form-input"
            />
            <p className="form-explicacion">
              El nombre completo por el que se conoce al investigador.
            </p>
            {errors.nombre && <div className="error-texto">{errors.nombre}</div>}
          </div>

          {/* --- CAMPO NACIONALIDAD --- */}
          <div className="form-grupo">
            <label htmlFor="nacionalidad" className="form-label">Nacionalidad:</label>
            <input
              id="nacionalidad"
              name="nacionalidad"
              type="text"
              value={data.nacionalidad}
              onChange={handleChange}
              className="form-input"
            />
            <p className="form-explicacion">¿De dónde procede? (Ej. Boston, Londres, Lima...)</p>
            {errors.nacionalidad && <div className="error-texto">{errors.nacionalidad}</div>}
          </div>

          {/* --- CAMPO RESIDENCIA --- */}
          <div className="form-grupo">
            <label htmlFor="residencia" className="form-label">Residencia:</label>
            <input
              id="residencia"
              name="residencia"
              type="text"
              value={data.residencia}
              onChange={handleChange}
              className="form-input"
            />
            <p className="form-explicacion">¿Dónde vive actualmente?</p>
            {errors.residencia && <div className="error-texto">{errors.residencia}</div>}
          </div>

          {/* --- CAMPO PROFESIÓN --- */}
          <div className="form-grupo">
            <label htmlFor="profesion" className="form-label">Profesión:</label>
            <input
              id="profesion"
              name="profesion"
              type="text"
              value={data.profesion}
              onChange={handleChange}
              className="form-input"
            />
            <p className="form-explicacion">Su tapadera. (Ej. Anticuario, Bibliotecario, Detective...)</p>
            {errors.profesion && <div className="error-texto">{errors.profesion}</div>}
          </div>

          {/* --- CAMPO EDAD --- */}
          <div className="form-grupo">
            <label htmlFor="edad" className="form-label">Edad:</label>
            <input
              id="edad"
              name="edad"
              type="number"
              value={data.edad}
              onChange={handleChange}
              className="form-input"
            />
            <p className="form-explicacion">¿Cuántos inviernos ha sobrevivido?</p>
            {errors.edad && <div className="error-texto">{errors.edad}</div>}
          </div>

          {/* --- CAMPO GÉNERO --- */}
          <div className="form-grupo">
            <label htmlFor="genero" className="form-label">Género:</label>
            <input
              id="genero"
              name="genero"
              type="text"
              value={data.genero}
              onChange={handleChange}
              className="form-input"
            />
            <p className="form-explicacion">(Hombre, Mujer, No especificado...)</p>
            {errors.genero && <div className="error-texto">{errors.genero}</div>}
          </div>

          {/* --- CAMPO JUGADOR --- */}
          <div className="form-grupo">
            <label htmlFor="nombre_jugador" className="form-label">Nombre del Jugador:</label>
            <input
              id="nombre_jugador"
              name="nombre_jugador"
              type="text"
              value={data.nombre_jugador}
              onChange={handleChange}
              className="form-input"
            />
            <p className="form-explicacion">Tu alias fuera de este mundo (para el Guardián).</p>
            {errors.nombre_jugador && <div className="error-texto">{errors.nombre_jugador}</div>}
          </div>

          {/* --- ¡CAMPO DE ARCHIVO MODIFICADO! --- */}
          <div className="form-grupo span-2">
            <label htmlFor="avatar_url" className="form-label">Token (Avatar):</label>
            <input
              id="avatar_url"
              name="avatar_url"
              type="file" // <-- ¡TIPO 'file'!
              onChange={handleChange}
              className="form-input"
              // ¡OJO! Los input 'file' no usan 'value'
            />
            <p className="form-explicacion">
              Sube la imagen del token (PNG, JPG, max 2MB). Si no subes, se usará el token por defecto.
            </p>
            {errors.avatar_url && <div className="error-texto">{errors.avatar_url}</div>}
          </div>

        </div> {/* Fin de .form-grid */}

        <button
          type="submit"
          className="form-submit-btn"
          disabled={processing}
        >
          {processing ? 'Creando...' : 'Forjar Investigador'}
        </button>
      </form>

      <Link href="/tablero" className="form-submit-btn" style={{marginTop: 10, textAlign: 'center', display: 'block', backgroundColor: '#6b4c1d', textDecoration: 'none'}}>
        Huir al Tablero
      </Link>
    </div>
  );
}
