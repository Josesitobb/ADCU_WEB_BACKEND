// routes/documentoRoutes.js
import express from 'express';
import Documento from '../models/DocumentoComparado.js';

const router = express.Router();

// ✅ GET: Obtener todos los documentos
router.get('/', async (req, res) => {
  try {
    const documentos = await Documento.find().sort({ fecha_comparacion: -1 });
    res.json(documentos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
});

// ✅ POST: Guardar documento desde Python u otra fuente
router.post('/', async (req, res) => {
  try {
    const nuevo = new Documento(req.body);
    await nuevo.save();
    res.status(201).json(nuevo);
  } catch (error) {
    console.error('❌ Error al guardar en MongoDB:', error);
    res.status(500).json({ error: 'Error al guardar el documento' });
  }
});

// ✅ DELETE: Eliminar documento (si lo usas desde el frontend)
router.delete('/:id', async (req, res) => {
  try {
    await Documento.findByIdAndDelete(req.params.id);
    res.status(200).json({ mensaje: 'Documento eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el documento' });
  }
});

export default router;