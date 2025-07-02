const ExcelJS = require('exceljs');
const db = require('../models/Report');

exports.generateReport = async (req, res) => {
    try {
        // 1. Consultar datos necesarios de la base de datos
        const data = await getReportData();
        
        // 2. Generar el reporte en Excel
        const reportBuffer = await generateExcel(data);
        
        // 3. Guardar registro del reporte generado
        await db.Report.create({
            generatedBy: req.userId,
            type: 'consulta',
            dataRange: `${new Date().toISOString()}`
        });
        
        // 4. Enviar el reporte
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_consulta.xlsx');
        res.send(reportBuffer);
    } catch (error) {
        console.error('Error generando reporte:', error);
        res.status(500).send('Error generando reporte');
    }
};

// Función para obtener datos del reporte
async function getReportData() {
    // Consultar múltiples modelos según necesidad
    const [contratistas, productos, cambios] = await Promise.all([
        db.Contratista.findAll(),
        db.Producto.findAll(),
        db.Cambio.findAll({
            where: { estado: ['pendiente', 'aprobado'] },
            include: [db.User]
        })
    ]);
    
    return {
        contratistas,
        productos,
        cambios,
        fechaGeneracion: new Date()
    };
}

// Función para generar Excel
async function generateExcel(data) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte Consulta');
    
    // Configurar columnas
    worksheet.columns = [
        { header: 'Contratista', key: 'contratista', width: 30 },
        { header: 'Producto', key: 'producto', width: 25 },
        { header: 'Cambios', key: 'cambios', width: 40 },
        { header: 'Estado', key: 'estado', width: 15 },
        { header: 'Responsable', key: 'responsable', width: 25 }
    ];
    
    // Llenar datos
    data.cambios.forEach(cambio => {
        const producto = data.productos.find(p => p.id === cambio.productoId);
        const contratista = data.contratistas.find(c => c.id === cambio.contratistaId);
        
        worksheet.addRow({
            contratista: contratista?.nombre || 'N/A',
            producto: producto?.nombre || 'N/A',
            cambios: cambio.descripcion,
            estado: cambio.estado,
            responsable: cambio.User?.username || 'Sistema'
        });
    });
    
    // Agregar metadata
    worksheet.addRow([]);
    worksheet.addRow(['Reporte generado el:', data.fechaGeneracion.toLocaleString()]);
    
    return workbook.xlsx.writeBuffer();
}

// Otras funciones del controlador...
exports.getReportHistory = async (req, res) => { /* ... */ };
exports.getReportDetails = async (req, res) => { /* ... */ };