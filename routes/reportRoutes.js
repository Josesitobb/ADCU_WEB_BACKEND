const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authJwt } = require('../middlewares');
const { validateUpload, validateReportParams } = require('../middlewares/reportValidator');

router.post('/upload', 
    [authJwt.verifyToken, ...validateUpload], 
    reportController.uploadPDFs
);

router.get('/generate/:reportId', 
    [authJwt.verifyToken, ...validateReportParams], 
    reportController.generateReport
);

router.get('/:reportId', 
    [authJwt.verifyToken, ...validateReportParams], 
    reportController.getReport
);

router.put('/approve/:reportId', 
    [authJwt.verifyToken, authJwt.isAdmin, ...validateReportParams], 
    reportController.approveReport
);

router.put('/reject/:reportId', 
    [authJwt.verifyToken, authJwt.isAdmin, ...validateReportParams], 
    reportController.rejectReport
);

module.exports = router;