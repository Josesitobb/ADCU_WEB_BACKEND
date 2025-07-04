const GestionDocumental = require('../models/GestionDocumental'); // Ajusta la ruta a tu modelo
const path = require('path');
const fs = require('fs');

exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params; // Id del documento a actualizar
    const archivos = req.files;

    if (!id) {
      return res.status(400).json({ message: 'ID del documento es requerido.' });
    }

    // Buscamos el documento existente
    const documento = await GestionDocumental.findById(id);
    if (!documento) {
      return res.status(404).json({ message: 'Documento no encontrado.' });
    }

    // Por cada campo, si viene un archivo, lo actualizamos
    if (archivos.carta_radicacion_cuenta_de_cobro) {
      documento.carta_radicacion_cuenta_de_cobro = archivos.carta_radicacion_cuenta_de_cobro[0].buffer;
    }
    if (archivos.ceritificado_de_cumplimiento) {
      documento.ceritificado_de_cumplimiento = archivos.ceritificado_de_cumplimiento[0].buffer;
    }
    if (archivos.certificado_de_cumplimiento_firmado) {
      documento.certificado_de_cumplimiento_firmado = archivos.certificado_de_cumplimiento_firmado[0].buffer;
    }
    if (archivos.informes_de_actividades) {
      documento.informes_de_actividades = archivos.informes_de_actividades[0].buffer;
    }
    if (archivos.informe_de_actividades_firmado) {
      documento.informe_de_actividades_firmado = archivos.informe_de_actividades_firmado[0].buffer;
    }
    if (archivos.certificado_de_calidad_contributiva) {
      documento.certificado_de_calidad_contributiva = archivos.certificado_de_calidad_contributiva[0].buffer;
    }
    if (archivos.copia_de_planilla_pago_seguridad_social) {
      documento.copia_de_planilla_pago_seguridad_social = archivos.copia_de_planilla_pago_seguridad_social[0].buffer;
    }
    if (archivos.rut) {
      documento.rut = archivos.rut[0].buffer;
    }
    if (archivos.rit) {
      documento.rit = archivos.rit[0].buffer;
    }
    if (archivos.capacitaciones_SST) {
      documento.capacitaciones_SST = archivos.capacitaciones_SST[0].buffer;
    }
    if (archivos.acta_de_inicio) {
      documento.acta_de_inicio = archivos.acta_de_inicio[0].buffer;
    }
    if (archivos.certificado_de_cuenta) {
      documento.certificado_de_cuenta = archivos.certificado_de_cuenta[0].buffer;
    }

    // Guardamos solo los cambios realizados
    await documento.save();

    res.json({
      message: 'Documento actualizado correctamente.',
      data: documento
    });

  } catch (error) {
    console.error('[ERROR ACTUALIZAR DOCUMENTO]', error);
    res.status(500).json({
      message: 'Error al actualizar el documento.',
      error: error.message
    });
  }
};
