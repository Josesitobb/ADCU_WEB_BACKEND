const ExcelJS = require('exceljs');
const db = require('../models');

exports.generateReport = async (req, res) => {
    try {
        // 1. Obtener datos
        const data = await getReportData();
        
        // 2. Generar Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reporte');
        
        // Columnas
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Contratista', key: 'contratista', width: 30 },
            { header: 'Producto', key: 'producto', width: 25 },
            { header: 'Estado', key: 'estado', width: 15 }
        ];
        
        // Datos de ejemplo (reemplaza con tus datos reales)
        worksheet.addRow({ id: 1, contratista: 'Contratista A', producto: 'Producto X', estado: 'Activo' });
        worksheet.addRow({ id: 2, contratista: 'Contratista B', producto: 'Producto Y', estado: 'Inactivo' });

        // 3. Preparar respuesta
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=reporte.xlsx'
        );
        
        // 4. Enviar archivo
        await workbook.xlsx.write(res);
        res.end();
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error al generar reporte');
    }
};