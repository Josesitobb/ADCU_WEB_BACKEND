const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();//almacenar en memoria como Buffer

const fileFilter = (req, file, cd)=> {
    //aceptar todos los pdfs
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf'){
        cb(null, true);
    }else{
        cb(new Error('Solo se permiten archivos pdf '), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits:{
        file:  10*1024*1024 //10MB
    }
}).fields([
    {name: 'carta_radicacion', maxCount: 1},
    {name: 'certificado_de_cumplimiento', maxCount: 1},
    {name: 'certificado_de_cumplimiento_firmado', maxCount: 1},
    {name: 'informe_de_actividades', maxCount: 1},
    {name: 'certificado_de_calidad_contributiva', maxCount: 1},
    {name: 'copia_de_planilla_de_pago_seguridad_social', maxCount: 1},
    {name: 'rut', maxCount: 1},
    {name: 'rit', maxCount: 1},
    {name: 'capacitaciones_SST', maxCount: 1},
    {name: 'acta_de_inicio', maxCount: 1},
    {name: 'acta_de_fin', maxCount: 1},
    {name: 'certificado_de_cuenta_bancaria', maxCount: 1}
]);

module.exports = upload;
