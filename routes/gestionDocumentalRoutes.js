const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');
const gestionDocumentalController = require ('../controllers/gestionDocumentalController');

router.post('/', upload, gestionDocumentalController.crearDocumento);
router.get('/', gestionDocumentalController.listarDocumentos);
router.get('/:id', gestionDocumentalController.obtenerDocumento);
router.get('/id/descargar/:tipo', gestionDocumentalController.descargarArchivo);
router.put('/:id', upload, gestionDocumentalController.actualizarDocumento);
router.delete('/:id', gestionDocumentalController.eliminarDocumento);

module.exports = router;

