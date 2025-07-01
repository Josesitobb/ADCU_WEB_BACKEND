const multer = require('multer');
const path = require('path');

// Configuración de Multer para almacenar PDFs
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads/pdfs');
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Validar que sea PDF
        if (path.extname(file.originalname) !== '.pdf') {
            return cb(new Error('Solo se permiten archivos PDF'));
        }
        cb(null, true);
    },
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB límite
    }
}).fields([
    { name: 'original', maxCount: 1 },
    { name: 'modified', maxCount: 1 }
]);

exports.uploadPDFs = (req, res) => {
    upload(req, res, async function (err) {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (!req.files['original'] || !req.files['modified']) {
            return res.status(400).json({ message: 'Se requieren ambos archivos: original y modificado' });
        }

        try {
            // Guardar información en la base de datos
            const report = await db.Report.create({
                originalFileName: req.files['original'][0].originalname,
                modifiedFileName: req.files['modified'][0].originalname,
                originalFilePath: req.files['original'][0].path,
                modifiedFilePath: req.files['modified'][0].path,
                uploadedBy: req.userId,
                status: 'uploaded'
            });

            res.status(201).json({
                message: 'Archivos subidos correctamente',
                reportId: report.id
            });
        } catch (error) {
            console.error('Error subiendo archivos:', error);
            res.status(500).json({ message: 'Error al subir archivos' });
        }
    });

   exports.getReport = async (req, res) => {
    try {
        const report = await db.Report.findByPk(req.params.reportId, {
            include: [
                { model: db.User, as: 'Uploader', attributes: ['id', 'username', 'email'] },
                { model: db.User, as: 'Approver', attributes: ['id', 'username', 'email'] },
                { model: db.User, as: 'Rejecter', attributes: ['id', 'username', 'email'] }
            ]
        });

        if (!report) {
            return res.status(404).json({ message: 'Reporte no encontrado' });
        }

        res.json(report);
    } catch (error) {
        console.error('Error obteniendo reporte:', error);
        res.status(500).json({ message: 'Error obteniendo reporte' });
    }
};

exports.approveReport = async (req, res) => {
    try {
        const report = await db.Report.findByPk(req.params.reportId);
        
        if (!report) {
            return res.status(404).json({ message: 'Reporte no encontrado' });
        }

        await report.update({
            status: 'approved',
            approvedBy: req.userId,
            rejectedBy: null
        });

        res.json({ message: 'Reporte aprobado exitosamente', report });
    } catch (error) {
        console.error('Error aprobando reporte:', error);
        res.status(500).json({ message: 'Error aprobando reporte' });
    }
};

exports.rejectReport = async (req, res) => {
    try {
        const report = await db.Report.findByPk(req.params.reportId);
        
        if (!report) {
            return res.status(404).json({ message: 'Reporte no encontrado' });
        }

        await report.update({
            status: 'rejected',
            rejectedBy: req.userId,
            approvedBy: null
        });

        res.json({ message: 'Reporte rechazado exitosamente', report });
    } catch (error) {
        console.error('Error rechazando reporte:', error);
        res.status(500).json({ message: 'Error rechazando reporte' });
    }
  };
};