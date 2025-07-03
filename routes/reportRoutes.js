const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Ruta para consultar y generar reportes (sin autenticación)
router.get('/generate', reportController.generateReport);

// Ruta para obtener reportes históricos (sin autenticación)
router.get('/history', reportController.getReportHistory);

// Ruta para obtener detalles de un reporte específico (sin autenticación)
router.get('/:reportId', reportController.getReportDetails);

module.exports = router;