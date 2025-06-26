const Product = require('../models/Products');
const ExcelJS = require('exceljs');

exports.generateProductReport = async (req, res) => {
    try {
        // 1. Obtener datos con filtros (ej: /api/products/report/excel?stock[lt]=100)
        const reportData = await Product.generateReportData(req.query);

        // 2. Configurar Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Productos');

        // 3. Definir columnas
        worksheet.columns = [
            { header: 'Nombre', key: 'Nombre', width: 30 },
            { header: 'Descripción', key: 'Descripción', width: 40 },
            { header: 'Precio', key: 'Precio', width: 15 },
            { header: 'Stock', key: 'Stock', width: 10 },
            { header: 'Categoría', key: 'Categoría', width: 20 },
            { header: 'Subcategoría', key: 'Subcategoría', width: 20 },
            { header: 'Fecha Creación', key: 'Fecha_Creación', width: 15 }
        ];

        // 4. Añadir datos y estilizar
        worksheet.addRows(reportData);
        worksheet.getRow(1).eachCell(cell => {
            cell.font = { bold: true, color: { argb: 'FFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F5496' } };
        });

        // 5. Enviar el archivo
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_productos.xlsx');
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        res.status(500).json({ error: "Error al generar reporte: " + error.message });
    }
};