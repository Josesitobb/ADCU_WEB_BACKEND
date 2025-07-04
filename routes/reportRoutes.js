const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Rutas de reportes (ORDEN CORRECTO)
router.get('/generate', reportController.generateReport);                 // Crear
router.get('/history', reportController.getReportHistory);               // Historial
router.get('/excel', reportController.downloadExcel);                    // Descargar historial
router.get('/excel-comparativo', reportController.generateStaticComparisonExcel); // ✅ Excel comparativo fijo
router.delete('/:reportId', reportController.deleteReport);              // Eliminar por ID
router.get('/:reportId', reportController.getReportDetails);             // Ver por ID

module.exports = router;
