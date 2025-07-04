const express = require('express');
const router = express.Router();

// importas todo en una sola línea
const {
  createNewDocument,
  getDocument,
  getDocumentById,
  updateDocument,
  deleteDocument
} = require('../controllers/documentoController.js');

const uploadDocumentos = require('../controllers/upload.js');

// tus rutas
router.post('/', uploadDocumentos, createNewDocument);
router.get('/', getDocument);
router.get('/:id', getDocumentById);
router.put('/:id', uploadDocumentos, updateDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
