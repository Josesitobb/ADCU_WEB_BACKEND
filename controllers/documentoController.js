const express = require('express');
const GestionDocumental = require('../models/documento.js');

exports.createNewDocument = async (req, res) => {
    try {
        const archivos = req.files || {};
        const datos = req.body;

        console.log('[CREACION DE EL DOCUMENTOS]');
        console.log('[REQ BODY]', datos);
        console.log('[REQ FILES]', archivos);

        const nuevoDoc = new GestionDocumental({
            Fecha_De_Creacion: new Date(datos.Fecha_De_Creacion),
            Tiempo_De_Retencion: Number(datos.Tiempo_De_Retencion),
            Ip_De_Modificacion: Number(datos.Ip_De_Modificacion),
            Estado: datos.Estado,
            Descripcion: datos.Descripcion,
            VersionD: datos.VersionD,
            Usuario_De_Creacion: datos.Usuario_De_Creacion,
            Usuario_De_Edicion: datos.Usuario_De_Edicion,
            gestion_de_contratos: datos.gestion_de_contratos,

            // Archivos en Buffer (ya sin error por undefined)
            carta_radicacion_cuenta_de_cobro: archivos?.carta_radicacion_cuenta_de_cobro?.[0]?.buffer,
            ceritificado_de_cumplimiento: archivos?.ceritificado_de_cumplimiento?.[0]?.buffer,
            certificado_de_cumplimiento_firmado: archivos?.certificado_de_cumplimiento_firmado?.[0]?.buffer,
            informes_de_actividades: archivos?.informes_de_actividades?.[0]?.buffer,
            informe_de_actividades_firmado: archivos?.informe_de_actividades_firmado?.[0]?.buffer,
            certificado_de_calidad_contributiva: archivos?.certificado_de_calidad_contributiva?.[0]?.buffer,
            copia_de_planilla_pago_seguridad_social: archivos?.copia_de_planilla_pago_seguridad_social?.[0]?.buffer,
            rut: archivos?.rut?.[0]?.buffer,
            rit: archivos?.rit?.[0]?.buffer,
            capacitaciones_SST: archivos?.capacitaciones_SST?.[0]?.buffer,
            acta_de_inicio: archivos?.acta_de_inicio?.[0]?.buffer,
            certificado_de_cuenta: archivos?.certificado_de_cuenta?.[0]?.buffer
        });

        await nuevoDoc.save();

        return res.status(200).json({
            success: true,
            message: 'Creación del documento',
            data: nuevoDoc
        });
    } catch (error) {
        console.error('[ERROR CREACION DOCUMENTO]', error);
        return res.status(500).json({
            success: false,
            message: 'Error al crear el documento',
            error: error.message
        });
    }
};


exports.getDocument = async (req, res) => {
  try {
    const documentos = await GestionDocumental.find();
    res.status(200).json({
      success: true,
      data: documentos
    });
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener documentos',
      error: error.message
    });
  }
};

exports.getDocumentById = async (req, res) => {
    try {
        const documento = await GestionDocumental.findById(req.params.id);
            if (!documento) {
                return res.status(404).json({
                    success: false,
                    message: 'Docuemnto no encontrado'
                });
            }
            res.status(200).json({
                success: true,
                data: documento
            });
    
    }catch(error){
        console.error('Error en getDocumentById: ', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el documento'
        });
    }
};

exports.updateDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const archivos = req.files;
        const datos = req.body;

        console.log('[ACTUALIZACION DE DOCUMENTO]');

        // Construimos el objeto de actualización
        const camposAActualizar = {
            Fecha_De_Creacion: datos.Fecha_De_Creacion ? new Date(datos.Fecha_De_Creacion) : undefined,
            Tiempo_De_Retencion: datos.Tiempo_De_Retencion ? Number(datos.Tiempo_De_Retencion) : undefined,
            Ip_De_Modificacion: datos.Ip_De_Modificacion ? Number(datos.Ip_De_Modificacion) : undefined,
            Estado: datos.Estado,
            Descripcion: datos.Descripcion,
            VersionD: datos.VersionD,
            Usuario_De_Creacion: datos.Usuario_De_Creacion,
            Usuario_De_Edicion: datos.Usuario_De_Edicion,
            gestion_de_contratos: datos.gestion_de_contratos,

            // Archivos en Buffer
            carta_radicacion_cuenta_de_cobro: archivos.carta_radicacion_cuenta_de_cobro?.[0]?.buffer,
            ceritificado_de_cumplimiento: archivos.ceritificado_de_cumplimiento?.[0]?.buffer,
            certificado_de_cumplimiento_firmado: archivos.certificado_de_cumplimiento_firmado?.[0]?.buffer,
            informes_de_actividades: archivos.informes_de_actividades?.[0]?.buffer,
            informe_de_actividades_firmado: archivos.informe_de_actividades_firmado?.[0]?.buffer,
            certificado_de_calidad_contributiva: archivos.certificado_de_calidad_contributiva?.[0]?.buffer,
            copia_de_planilla_pago_seguridad_social: archivos.copia_de_planilla_pago_seguridad_social?.[0]?.buffer,
            rut: archivos.rut?.[0]?.buffer,
            rit: archivos.rit?.[0]?.buffer,
            capacitaciones_SST: archivos.capacitaciones_SST?.[0]?.buffer,
            acta_de_inicio: archivos.acta_de_inicio?.[0]?.buffer,
            certificado_de_cuenta: archivos.certificado_de_cuenta?.[0]?.buffer
        };

        // Eliminamos los campos undefined para evitar sobreescribir con null
        Object.keys(camposAActualizar).forEach(
            key => camposAActualizar[key] === undefined && delete camposAActualizar[key]
        );

        // Actualizamos el documento en MongoDB
        const docActualizado = await GestionDocumental.findByIdAndUpdate(
            id,
            { $set: camposAActualizar },
            { new: true } // devuelve el documento ya actualizado
        );

        if (!docActualizado) {
            return res.status(404).json({ message: 'Documento no encontrado' });
        }

        res.status(200).json({
            message: 'Documento actualizado correctamente',
            data: docActualizado
        });
    } catch (error) {
        console.error('[ERROR AL ACTUALIZAR DOCUMENTO]', error);
        res.status(500).json({ message: 'Error al actualizar el documento', error });
    }
};

exports.deleteDocument = async (req, res) => {
    try{
        const deleteDocumentd = await GestionDocumental.findByIdAndDelete(req.params.id);
            if (!deleteDocumentd) {
                return res.status(404).json({
                    success: false,
                    message: 'Documento no encontrado'
                });
            }
            res.status(200).json({
                success: true,
                message: 'Documento eliminado correctamente'        
                });
    }catch(error){
        console.error('Error al eliminar el documento: ', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el documento',
            error: error.message
        });
    }
};