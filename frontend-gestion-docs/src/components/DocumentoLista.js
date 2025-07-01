import React, { useEffect, useState } from 'react';
import API from '../api';

function DocumentoLista({ onSelect }) {
  const [documentos, setDocumentos] = useState([]);

  const cargarDocumentos = async () => {
    try {
      const res = await API.get('/');
      setDocumentos(res.data.data);
    } catch (err) {
      console.error('Error al listar:', err);
    }
  };

  useEffect(() => {
    cargarDocumentos();
  }, []);

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este documento?')) return;
    try {
      await API.delete(`/${id}`);
      cargarDocumentos();
    } catch (err) {
      console.error('Error al eliminar:', err);
    }
  };

  return (
    <div>
      <h4>Documentos</h4>
      <ul className="list-group">
        {documentos.map(doc => (
          <li key={doc._id} className="list-group-item d-flex justify-content-between align-items-center">
            <span>{doc.titulo}</span>
            <div>
              <button className="btn btn-sm btn-info me-2" onClick={() => onSelect(doc._id)}>Ver</button>
              <button className="btn btn-sm btn-danger" onClick={() => eliminar(doc._id)}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DocumentoLista;
