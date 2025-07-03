const ExcelJS = require('exceljs');
const Report = require('../models/Report');

// 1. Generar reporte en Excel
exports.generateReport = async (req, res) => {
    try {
        const reports = await Report.find(req.query)
            .populate('generatedBy', 'username')
            .lean();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reportes');

        worksheet.columns = [
            { header: 'ID', key: '_id', width: 25 },
            { header: 'Tipo', key: 'type', width: 15 },
            { header: 'Rango', key: 'dataRange', width: 20 },
            { header: 'Generado Por', key: 'generator', width: 25 },
            { header: 'Fecha', key: 'createdAt', width: 20 },
            { header: 'Archivo', key: 'filePath', width: 30 }
        ];

        reports.forEach(report => {
            worksheet.addRow({
                _id: report._id,
                type: report.type,
                dataRange: report.dataRange,
                generator: report.generatedBy?.username || 'N/A',
                createdAt: new Date(report.createdAt).toLocaleDateString(),
                filePath: report.filePath
            });
        });

        // Estilo profesional
        worksheet.getRow(1).eachCell(cell => {
            cell.font = { bold: true, color: { argb: 'FFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F5496' } };
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=reportes.xlsx');
        
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error en generateReport:', error);
        res.status(500).json({ 
            error: 'Error al generar reporte',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// 2. Obtener historial de reportes
exports.getReportHistory = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('generatedBy', 'username')
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        res.json(reports.map(report => ({
            id: report._id,
            type: report.type,
            createdAt: report.createdAt,
            generatedBy: report.generatedBy?.username || 'Sistema',
            filePath: report.filePath
        })));

    } catch (error) {
        console.error('Error en getReportHistory:', error);
        res.status(500).json({ 
            error: 'Error al obtener historial',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// 3. Obtener detalles de un reporte específico
exports.getReportDetails = async (req, res) => {
    try {
        const report = await Report.findById(req.params.reportId)
            .populate('generatedBy', 'username email')
            .lean();

        if (!report) {
            return res.status(404).json({ error: 'Reporte no encontrado' });
        }

        res.json({
            id: report._id,
            type: report.type,
            dataRange: report.dataRange,
            createdAt: report.createdAt,
            generatedBy: {
                username: report.generatedBy?.username || 'Sistema',
                email: report.generatedBy?.email
            },
            filePath: report.filePath,
            downloadUrl: `/api/reports/download/${report._id}`
        });

    } catch (error) {
        console.error('Error en getReportDetails:', error);
        res.status(500).json({ 
            error: 'Error al obtener detalles',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};