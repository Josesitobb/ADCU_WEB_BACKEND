const express = require('express');
const router = express.Router();
const multer = require('multer');
const controller = require('../controllers/gestionDocumentalController');

const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Solo se permiten archivos PDF'));
    }
});

// Rutas CRUD
router.post('/', upload.array('documentos'), controller.crearDocumento);
router.get('/', controller.listarDocumentos);
router.get('/:id', controller.obtenerDocumento);
router.put('/:id', upload.array('documentos'), controller.actualizarDocumento);
router.delete('/:id', controller.eliminarDocumento);

// Ruta para descargar y eliminar archivos específicos
router.get('/:id/archivo/:docId', controller.descargarArchivo);
router.delete('/:id/archivo/:docId', controller.eliminarArchivo);

module.exports = router;
