import React, { useEffect, useState } from 'react';
import API from '../api';

function DocumentoDetalle({ id }) {
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    if (!id) return;
    API.get(`/${id}`).then(res => setDetalle(res.data.data)).catch(console.error);
  }, [id]);

  if (!id) return null;

  return (
    <div className="mt-4">
      <h5>Detalle del documento</h5>
      {detalle ? (
        <div>
          <p><strong>Título:</strong> {detalle.titulo}</p>
          <p><strong>Descripción:</strong> {detalle.descripcion}</p>
          <p><strong>Creado:</strong> {new Date(detalle.fecha_creacion).toLocaleString()}</p>
        </div>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
}

export default DocumentoDetalle;
