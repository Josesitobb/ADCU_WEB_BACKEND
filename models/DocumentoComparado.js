// models/DocumentoComparado.js
import mongoose from 'mongoose';

// Esquema flexible para aceptar cualquier campo que venga de los PDFs
const DocumentoSchema = new mongoose.Schema({}, {
  strict: false,            // 🔓 Acepta campos no definidos previamente
  timestamps: true          // 🕒 Agrega createdAt y updatedAt automáticamente
});

// Exportación del modelo
export default mongoose.model('Documento', DocumentoSchema);