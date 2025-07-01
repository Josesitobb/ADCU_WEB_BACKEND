// config/multerConfig.js
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configuración de almacenamiento en memoria (Buffer)
const storage = multer.memoryStorage();

// Configuración de almacenamiento en disco (opcional)
/*
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/temp'));
  },
  filename: (req, file, cb) => {
    const uniqueName = ${uuidv4()}${path.extname(file.originalname)};
    cb(null, uniqueName);
  }
});
*/

// Filtro para aceptar múltiples tipos de archivos
const fileFilter = (req, file, cb) => {
  // Lista de tipos MIME permitidos (puedes ampliarla)
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

// Configuración principal de Multer
const upload = multer({
  storage: storage, // Usamos memoryStorage para manejar como Buffer
  // storage: diskStorage, // Alternativa para guardar en disco
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Límite de 10MB por archivo
    files: 10 // Máximo 10 archivos por petición
  }
});

// Middleware para manejar múltiples archivos dinámicamente
const dynamicUpload = (req, res, next) => {
  // Usar .any() para aceptar cualquier nombre de campo de archivo
  upload.any()(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'El archivo excede el tamaño máximo permitido (10MB)'
        });
      }
      if (err.message === 'Tipo de archivo no permitido') {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Error al subir archivos',
        error: err.message
      });
    }
    next();
  });
};

module.exports = dynamicUpload;