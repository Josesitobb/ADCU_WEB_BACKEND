const ExcelJS = require('exceljs');
const Report = require('../models/Report');

// 1. Crear y guardar reporte
exports.generateReport = async (req, res) => {
  try {
    const reportData = {
      type: 'Comparativo',
      dataRange: 'Enero 2025',
      generatedBy: req.user?._id || null, // si usas auth
      filePath: '', // si luego generas Excel o PDF
      datos: {
        firmas: {
          contratista: "ALBA STELLA FALKONERTH ROZO",
          supervisorInicio: "ANDREA MELISSA MORALES CANO",
          supervisorOtros: "ALEXANDRA MEJIA GUZMÁN"
        },
        fechas: {
          actaInicio: "2025-01-03",
          certificado: "2025-02-03"
        },
        datosContratista: {
          nombre: "ALBA STELLA FALKONERTH ROZO",
          identificacion: "52779382",
          contrato: "422-2024-CPS-P(124427)"
        },
        valores: {
          totalContrato: 17082000,
          primerPago: 7971600
        },
        observaciones: {
          firma: "Inconsistencia en firmas de supervisor",
          fechas: "Fechas consistentes",
          identificacion: "Formato consistente con/sin puntos"
        }
      }
    };

    const nuevoReporte = await Report.create(reportData);

    res.status(201).json({
      success: true,
      message: '✅ Reporte creado exitosamente',
      reportId: nuevoReporte._id
    });

  } catch (error) {
    console.error('Error en generateReport:', error);
    res.status(500).json({
      success: false,
      message: '❌ Error al generar el reporte',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 2. Historial
exports.getReportHistory = async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(reports.map(r => ({
      id: r._id,
      type: r.type,
      createdAt: r.createdAt,
      dataRange: r.dataRange || '',
      generatedBy: r.generatedBy || 'Sistema',
      filePath: r.filePath || null
    })));
  } catch (error) {
    console.error('Error en getReportHistory:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
};

// 3. Detalles por ID
exports.getReportDetails = async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId).lean();

    if (!report) {
      return res.status(404).json({ error: '⚠️ Reporte no encontrado' });
    }

    res.json({
      id: report._id,
      type: report.type,
      dataRange: report.dataRange,
      createdAt: report.createdAt,
      generatedBy: report.generatedBy || 'Sistema',
      filePath: report.filePath,
      datos: report.datos
    });

  } catch (error) {
    res.status(500).json({ error: 'Error al obtener detalles' });
  }
};

// 4. Descargar Excel del historial
exports.downloadExcel = async (req, res) => {
  try {
    const reports = await Report.find().lean();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Historial Reportes');

    worksheet.columns = [
      { header: 'ID', key: '_id', width: 25 },
      { header: 'Tipo', key: 'type', width: 20 },
      { header: 'Rango', key: 'dataRange', width: 20 },
      { header: 'Fecha Creación', key: 'createdAt', width: 20 }
    ];

    reports.forEach(report => {
      worksheet.addRow({
        _id: report._id,
        type: report.type,
        dataRange: report.dataRange,
        createdAt: new Date(report.createdAt).toLocaleString()
      });
    });

    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true };
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=historial_reportes.xlsx');
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error al descargar Excel:', error);
    res.status(500).json({ error: 'No se pudo generar el archivo' });
  }
};

// 5. Eliminar por ID
exports.deleteReport = async (req, res) => {
  try {
    const deleted = await Report.findByIdAndDelete(req.params.reportId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: '⚠️ Reporte no encontrado para eliminar' });
    }
    res.json({ success: true, message: '🗑️ Reporte eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
};
