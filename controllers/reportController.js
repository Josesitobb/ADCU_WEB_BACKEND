const PDFExtract = require('pdf-text-extract');
const ExcelJS = require('exceljs');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const db = require('../models');
const User = db.User;

exports.generateReport = async (req, res) => {
    try {
        // 1. Obtener PDFs a comparar (esto es un ejemplo, ajusta según tu lógica)
        const pdfFolderPath = path.join(__dirname, '../uploads/pdfs');
        const pdfFiles = fs.readdirSync(pdfFolderPath).filter(file => file.endsWith('.pdf'));
        
        if (pdfFiles.length < 2) {
            return res.status(400).send('Se necesitan al menos 2 PDFs para comparar');
        }

        // 2. Comparar PDFs y extraer diferencias
        const comparisonResults = await comparePDFs(
            path.join(pdfFolderPath, pdfFiles[0]),
            path.join(pdfFolderPath, pdfFiles[1])
        );

        // 3. Generar Excel con los resultados
        const excelBuffer = await generateExcelReport(comparisonResults);

        // 4. Enviar el reporte como descarga
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_comparacion.pdf');
        res.send(excelBuffer);
    } catch (error) {
        console.error('Error generando reporte:', error);
        res.status(500).send('Error generando reporte');
    }
};

async function comparePDFs(pdfPath1, pdfPath2) {
    try {
        const [text1, text2] = await Promise.all([
            extractTextFromPDF(pdfPath1),
            extractTextFromPDF(pdfPath2)
        ]);

        // Extraer contratista (ejemplo: busca un patrón en el PDF)
        const contractorPattern = /Contratista:\s*(.+)/i;
        const contractorMatch = text1.match(contractorPattern) || text2.match(contractorPattern);
        const contractorName = contractorMatch ? contractorMatch[1].trim() : 'Desconocido';

        // Comparación más avanzada
        const lines1 = text1.split('\n');
        const lines2 = text2.split('\n');
        
        const changes = [];
        let errorCount = 0;

        // Comparar línea por línea
        const maxLines = Math.max(lines1.length, lines2.length);
        for (let i = 0; i < maxLines; i++) {
            const line1 = lines1[i] || '';
            const line2 = lines2[i] || '';

            if (line1.trim() !== line2.trim()) {
                changes.push({
                    lineNumber: i + 1,
                    original: line1.trim(),
                    modified: line2.trim(),
                    type: determineChangeType(line1, line2)
                });

                if (isCriticalChange(line1, line2)) {
                    errorCount++;
                }
            }
        }

        return {
            contratista: contractorName,
            cambios: changes,
            errores: errorCount,
            estado: changes.length > 0 ? 'Cambios Detectados' : 'Sin Cambios'
        };
    } catch (error) {
        console.error('Error comparando PDFs:', error);
        throw error;
    }
}

function determineChangeType(original, modified) {
    if (!original && modified) return 'Adición';
    if (original && !modified) return 'Eliminación';
    return 'Modificación';
}

function isCriticalChange(original, modified) {
    // Implementa lógica para determinar si un cambio es crítico/error
    const criticalKeywords = ['precio', 'total', 'fecha', 'cláusula'];
    const lowerOriginal = original.toLowerCase();
    const lowerModified = modified.toLowerCase();
    
    return criticalKeywords.some(keyword => 
        lowerOriginal.includes(keyword) || lowerModified.includes(keyword)
    );
}
async function generateExcelReport(data) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');

    // Estilos para el Excel
    worksheet.columns = [
        { header: 'Contratista', key: 'contratista', width: 30 },
        { header: 'Cambios', key: 'cambios', width: 50 },
        { header: 'Errores', key: 'errores', width: 15 },
        { header: 'Estado', key: 'estado', width: 20 },
        { header: 'Aprobado por', key: 'aprobadoPor', width: 25 },
        { header: 'Rechazado por', key: 'rechazadoPor', width: 25 }
    ];

    // Agregar datos
    worksheet.addRow({
        contratista: data.contratista,
        cambios: data.cambios.join('\n'),
        errores: data.errores,
        estado: data.estado,
        aprobadoPor: data.aprobadoPor,
        rechazadoPor: data.rechazadoPor
    });

    // Agregar gráfico (opcional)
    if (data.errores > 0) {
        addChartToWorksheet(worksheet);
    }

    // Generar buffer del Excel
    return workbook.xlsx.writeBuffer();
}

function addChartToWorksheet(worksheet) {
    // Implementación de gráficos en Excel
    // Esto es opcional y puede personalizarse
}