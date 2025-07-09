const Report = require('../models/Report');
const ExcelJS = require('exceljs');

exports.generateReport = async (req, res) => {
  try {
    const reportData = {
      type: 'Comparativo',
      dataRange: 'Enero 2025',
      generatedBy: req.user?._id || null, // puede ser null
      filePath: '',
      firmas: {
        contratista: "ALBA STELLA FALKONERTH ROZO",
        supervisorInicio: "ANDREA MELISSA MORALES CANO",
        supervisorOtros: "ALEXANDRA MEJIA GUZMÁN"
      },
      fechas: {
        actaInicio: new Date("2025-01-03"),
        certificado: new Date("2025-02-03")
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
    };

    const nuevoReporte = await Report.create(reportData);

    res.status(201).json({
      success: true,
      message: '✅ Reporte creado exitosamente',
      reportId: nuevoReporte._id,
      data: {
        type: nuevoReporte.type,
        dataRange: nuevoReporte.dataRange,
        createdAt: nuevoReporte.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error en generateReport:', error);
    res.status(500).json({
      success: false,
      message: '❌ Error al generar el reporte',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 2. Obtener historial
exports.getReportHistory = async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select('_id type dataRange createdAt generatedBy filePath')
      .lean();

    if (!reports || reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: '⚠️ No se encontraron reportes'
      });
    }

    res.json({
      success: true,
      count: reports.length,
      data: reports.map(r => ({
        id: r._id,
        type: r.type,
        createdAt: r.createdAt,
        dataRange: r.dataRange || '',
        generatedBy: r.generatedBy || 'Sistema',
        filePath: r.filePath || null
      }))
    });

  } catch (error) {
    console.error('❌ Error en getReportHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 3. Obtener detalles por ID
exports.getReportDetails = async (req, res) => {
  try {
    const { reportId } = req.params;

    if (!reportId?.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID de reporte inválido',
        details: `Formato recibido: ${reportId || 'nulo'}`
      });
    }

    const report = await Report.findById(reportId).lean();
    if (!report) {
      return res.status(404).json({ 
        success: false,
        message: '⚠️ Reporte no encontrado',
        reportId 
      });
    }

    res.json({
      success: true,
      data: {
        id: report._id,
        type: report.type,
        dataRange: report.dataRange,
        createdAt: report.createdAt,
        generatedBy: report.generatedBy || 'Sistema',
        filePath: report.filePath,
        datos: report.datos
      }
    });

  } catch (error) {
    console.error('❌ Error en getReportDetails:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener detalles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 4. Descargar Excel del historial
exports.downloadExcel = async (req, res) => {
  try {
    const reports = await Report.find()
      .select('_id type dataRange createdAt')
      .lean();

    if (!reports || reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay reportes para exportar'
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Historial Reportes');

    // Configuración de columnas
    worksheet.columns = [
      { header: 'ID', key: '_id', width: 25 },
      { header: 'Tipo', key: 'type', width: 20 },
      { header: 'Rango', key: 'dataRange', width: 20 },
      { header: 'Fecha Creación', key: 'createdAt', width: 20 }
    ];

    // Agregar datos
    reports.forEach(report => {
      worksheet.addRow({
        _id: report._id,
        type: report.type,
        dataRange: report.dataRange,
        createdAt: new Date(report.createdAt).toLocaleString()
      });
    });

    // Estilo para la cabecera
    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
      };
    });

    // Configurar respuesta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=historial_reportes.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error al descargar Excel:', error);
    res.status(500).json({ 
      success: false,
      message: 'No se pudo generar el archivo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 5. Eliminar por ID
exports.deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    if (!reportId?.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID de reporte inválido'
      });
    }

    const deleted = await Report.findByIdAndDelete(reportId);
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        message: '⚠️ Reporte no encontrado para eliminar',
        reportId
      });
    }

    res.json({ 
      success: true, 
      message: '🗑️ Reporte eliminado correctamente',
      deletedId: deleted._id
    });

  } catch (error) {
    console.error('Error al eliminar reporte:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al eliminar',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 6. Descargar reporte comparativo prellenado (sin usar ID)
exports.generateStaticComparisonExcel = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Reporte Comparativo');

    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF305496' } },
      alignment: { horizontal: 'center' }
    };

    const datos = {
      firmas: {
        contratista: "ALBA STELLA FALKONERTH ROZO",
        supervisorInicio: "ANDREA MELISSA MORALES CANO",
        supervisorOtros: "ALEXANDRA MEJIA GUZMÁN",
        observacion: "❌ No Aprobado - Supervisores diferentes"
      },
      fechas: {
        actaInicio: "03/01/2025",
        certificado: "03/02/2025",
        periodo: "03-31/01/2025",
        observacion: "✔️ Fechas consistentes"
      },
      contratista: {
        nombre: "ALBA STELLA FALKONERTH ROZO",
        cedula: "52779382 / 52.779.382",
        contrato: "422-2024-CPS-P(124427)",
        observacion: "✔️ Datos consistentes"
      },
      soportes: {
        RIT: "✔️ Coincide",
        Planilla: "❌ No definido",
        RUT: "✔️ Coincide",
        CertificadoCuenta: "✔️ Coincide",
        observacion: "❌ Faltan patrones definidos"
      },
      valores: {
        total: "$17'082.000",
        primerPago: "$7'971.600",
        observacion: "✔️ Valores consistentes"
      },
      problemas: [
        "Formato de cédula inconsistente",
        "Apellido FALKONERTH con variación: 'FALKONERH'"
      ]
    };

    // Función para agregar secciones
    const addSection = (title, data) => {
      sheet.addRow([title]).eachCell(cell => Object.assign(cell, headerStyle));
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'observacion') {
          sheet.addRow([key, value]);
        }
      });
      if (data.observacion) {
        sheet.addRow(['Observación', data.observacion]);
      }
      sheet.addRow([]);
    };

    // Construir el reporte
    addSection('1. Comparación de Firmas', datos.firmas);
    addSection('2. Comparación de Fechas', datos.fechas);
    addSection('3. Datos del Contratista', datos.contratista);
    addSection('4. Verificación de Soportes', datos.soportes);
    addSection('5. Comparación de Valores', datos.valores);

    // Problemas detectados
    sheet.addRow(['6. Problemas Detectados']).eachCell(cell => Object.assign(cell, headerStyle));
    datos.problemas.forEach(p => sheet.addRow([`⚠️ ${p}`]));
    sheet.addRow([]);

    // Resultado final
    sheet.addRow(['7. Resultado Final']).eachCell(cell => Object.assign(cell, headerStyle));
    const aprobado = datos.firmas.observacion.includes('✔️') && 
                     datos.soportes.observacion.includes('✔️');
    sheet.addRow(['Estado del Reporte', aprobado ? '✅ Aprobado' : '❌ No Aprobado']);

    // Ajustar ancho de columnas
    sheet.columns = [
      { width: 30 },
      { width: 50 }
    ];

    // Configurar respuesta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=ReporteComparativo.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error al generar Excel fijo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al generar Excel',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

