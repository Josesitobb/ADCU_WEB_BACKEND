const { check } = require('express-validator');

exports.validateUpload = [
    check('contratista')
        .notEmpty().withMessage('El nombre del contratista es requerido')
        .isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),
    
    check('projectId')
        .optional()
        .isInt().withMessage('ID de proyecto debe ser numérico'),
    
    // La validación de archivos se maneja en multer
];

exports.validateReportParams = [
    check('reportId')
        .isInt().withMessage('ID de reporte debe ser numérico')
        .toInt()
];