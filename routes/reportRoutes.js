const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authJwt = require('../middlewares/authJwt');

// Ruta para consultar y generar reportes
router.get('/generate', 
    authJwt.verifyToken, 
    reportController.generateReport
);

// Ruta para obtener reportes históricos
router.get('/history', 
    authJwt.verifyToken, 
    reportController.getReportHistory
);

// Ruta para obtener detalles de un reporte específico
router.get('/:reportId', 
    authJwt.verifyToken, 
    reportController.getReportDetails
);

module.exports = router;