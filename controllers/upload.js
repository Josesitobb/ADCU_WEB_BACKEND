const multer = require('multer');


// Usamos memoria para tener el archivo en buffer sin guardarlo en disco
const storage = multer.memoryStorage();

// Middleware de multer
const upload = multer({ storage: storage });

// Definimos los campos que esperamos en el formulario
const uploadDocumentos = upload.fields([
  { name: 'carta_radicacion_cuenta_de_cobro', maxCount: 1 },
  { name: 'ceritificado_de_cumplimiento', maxCount: 1 },
  { name: 'certificado_de_cumplimiento_firmado', maxCount: 1 },
  { name: 'informes_de_actividades', maxCount: 1 },
  { name: 'informe_de_actividades_firmado', maxCount: 1 },
  { name: 'certificado_de_calidad_contributiva', maxCount: 1 },
  { name: 'copia_de_planilla_pago_seguridad_social', maxCount: 1 },
  { name: 'rut', maxCount: 1 },
  { name: 'rit', maxCount: 1 },
  { name: 'capacitaciones_SST', maxCount: 1 },
  { name: 'acta_de_inicio', maxCount: 1 },
  { name: 'certificado_de_cuenta', maxCount: 1 }
]);

module.exports = uploadDocumentos;