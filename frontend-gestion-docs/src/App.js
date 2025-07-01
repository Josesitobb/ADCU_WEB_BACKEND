import React, { useState } from 'react';
import DocumentoForm from './components/DocumentoForm';
import DocumentoLista from './components/DocumentoLista';
import DocumentoDetalle from './components/DocumentoDetalle';

function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [refresh, setRefresh] = useState(false);

  return (
    <div className="container mt-4">
      <h2>Gestión Documental</h2>
      <DocumentoForm onUpload={() => setRefresh(!refresh)} />
      <DocumentoLista onSelect={setSelectedId} key={refresh} />
      <DocumentoDetalle id={selectedId} />
    </div>
  );
}

export default App;
