const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/generate', reportController.generateReport);       // Crear
router.get('/history', reportController.getReportHistory);     // Historial
router.get('/excel', reportController.downloadExcel);          // Descargar Excel
router.get('/:reportId', reportController.getReportDetails);   // Por ID
router.delete('/:reportId', reportController.deleteReport);    // Eliminar

module.exports = router;