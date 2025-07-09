const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Rutas de reportes (ordenadas de más específicas a más genéricas)
router.post('/generate', reportController.generateReport);                         // Crear reporte (POST)
router.get('/history', reportController.getReportHistory);                        // Obtener historial
router.get('/export/excel', reportController.downloadExcel);                      // Exportar historial a Excel
router.get('/template/comparative', reportController.generateStaticComparisonExcel); // Generar plantilla comparativa
router.get('/:reportId', reportController.getReportDetails);                      // Ver detalle por ID
router.delete('/:reportId', reportController.deleteReport);                       // Eliminar por ID

module.exports = router;

