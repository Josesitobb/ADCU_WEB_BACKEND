import React, { useState } from 'react';
import API from '../api';

function DocumentoForm({ onUpload }) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [archivos, setArchivos] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('titulo', titulo);
    form.append('descripcion', descripcion);
    for (let i = 0; i < archivos.length; i++) {
      form.append('documentos', archivos[i]);
    }

    try {
      await API.post('/', form);
      onUpload(); // actualiza la lista
      setTitulo('');
      setDescripcion('');
      setArchivos([]);
    } catch (err) {
      console.error('Error al subir:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="mb-2">
        <input type="text" className="form-control" placeholder="Título" value={titulo} onChange={e => setTitulo(e.target.value)} required />
      </div>
      <div className="mb-2">
        <textarea className="form-control" placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} required />
      </div>
      <div className="mb-2">
        <input type="file" className="form-control" multiple onChange={e => setArchivos(e.target.files)} accept="application/pdf" />
      </div>
      <button className="btn btn-primary">Subir Documento</button>
    </form>
  );
}

export default DocumentoForm;
