const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Rutas de reportes
router.get('/generate', reportController.generateReport);
router.get('/history', reportController.getReportHistory);
router.get('/:reportId', reportController.getReportDetails);

// Exportación CORRECTA (asegúrate de que esta línea esté exactamente así)
module.exports = router;