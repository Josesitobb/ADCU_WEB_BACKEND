const gestionDocumental = require('../models/gestionDocumental');
const mongoose = require('mongoose');

const gestionDocumentalController = {
     /**
     * Crear un nuevo registro de gestión documental con archivos
     */
    crearDocumento: async (req, res) =>{
        try{
            // Extraer archivos del request (debes configurar multer para manejar múltiples archivos)
            const file = req.file;
            const body = req.body;

            // Mapear los archivos subidos a los campos correspondientes
            const documentos={
                carta_radicacion_cuenta_de_cobro: file['carta_radicacion_cuenta_de_cobro']?.[0]?.buffer || null,
                certificado_de_cumplimiento: file['certificado_de_cumplimiento']?.[0]?.buffer || null,
                certificado_de_cumplimiento_firmado: file['certificado_de_cumplimiento_firmado']?.[0]?.buffer || null,
                informe_de_actividades: file['informe_de_actividades']?.[0]?.buffer || null,
                certificado_de_calidad_contributiva: file['certificado_de_calidad_contributiva']?.[0]?.buffer || null,
                copia_de_planilla_de_pago_seguridad_social: file['copia_de_planilla_de_pago_seguridad_social']?.[0]?.buffer || null,
                rut: file['rut']?.[0]?.buffer || null,
                rit: file['rit']?.[0]?.buffer || null,
                capacitaciones_SST: file['capacitaciones_SST']?.[0]?.buffer || null,
                acta_de_inicio: file['acta_de_inicio']?.[0]?.buffer || null,
                certificado_de_cuenta_bancaria: file['certificado_de_cuenta_bancaria']?.[0]?.buffer || null
            };
            //creacion el nuevo documento
            const nuevoDocumento = new gestionDocumental({
                ...body,
                documentos : documentos 
            });
            //guaardar en la base de datos
            const documentoGuardado = await nuevoDocumento.save();
            res.status(201).json({
                success: true,
                message: 'Documento creado existosamente',
                data: {
                    id: documentoGuardado._id,
                    id_gestion_documental: documentoGuardado.id_gestion_documental,
                    estado: documentoGuardado.estado
                }
            });
        }catch(error){
            res.status(500).json({
                success: false,
                message: 'Error al crear el documento',
                error: error.message
            });
        }
    },
     /**
     * Obtener un documento por ID (sin los buffers de archivos por defecto)
     */
    obtenerDocumento: async (req, res) =>{
        try{
            const documento = await gestionDocumental.findById(req.params.id)
                .populate('gestion_de_contratos_id')
                .select('-documentos'); // Excluimos los buffers por defecto
        
            if(!documento){
                return res.status(404).json({
                success: false,
                message: 'Documento no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                data: documento
            });        
        }catch(error){
            res.status(500).json({
                success: false,
                message:'Error al obtener el documento',
                errro: error.message
            });
        }
    },
     /**
     * Descargar un archivo específico de un documento
     */
    descargarArchivo: async (req, res) =>{
        try{
            const {id, tipo } = req.params;
            //validar que el tipo de archivo sea valido
            const tiposValidos =[
                'carta_radicacion_cuenta_de_cobro',
                'certificado_de_cumplimiento',
                'certificado_de_cumplimiento_firmado',
                'informe_de_actividades',
                'certificado_de_calidad_contributiva',
                'copia_de_planilla_de_pago_seguridad_social',
                'rut',
                'rit',
                'capacitaciones_SST',
                'acta_de_inicio',
                'certificado_de_cuenta_bancaria'
            ];

            if (!tiposValidos.includes(tipo)){
                return res.status(400).json({
                    success:false,
                    message: 'Tipos de archivo no valido'
                });
            }
            // Obtener solo el campo necesario
            const documento = await gestionDocumental.findById(id)
            .select(`documento.${tipo}`);

            if (!documento || !documento.documentos[tipo]){
                return res.status(404).json({
                    success: false,
                    message: 'Archivo no encontrado'
                });
            }
            //configuracion del heards para la descarga
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${tipo}.pdf`);

            //enviar el buffer como respuesta 
            res.send(documento.documentos[tipo]);
        }catch(error){
            res.status(500).json({
                success: false,
                message: 'Error al descargar el archivo',
                error: error.message
            });
        }
    },
      /**
     * Actualizar un documento (archivos específicos)
     */
    actualizarDocumento: async (req, res) =>{
        try{
            const {id} = req.params;
            const files = req.file;
            const body = req.body;

            //obtener el documento actual
            const documentoActual = await gestionDocumental.findById(id);

            if (!documentoActual){
                return res.status(404).json({
                    success: false,
                    message: 'Documento no encontrado'
                });
            }

            //preparacion la actualizacion 

            const updateData = {...body};
            const documentos = {...documentoActual.documentos};

            //Actualizar solo los documentos que hayan subido
            if (files){
                Object.keys(files).forEach(key=>{
                    const fielMap ={
                        'carta_radicacion': 'carta_radicacion_cuenta_de_cobro',
                        'certificado_de_cumplimiento': 'certificado_de_cumplimento',
                        'certificado_de_cumplimiento_firmado': 'certificado_de_cumplimiento_firmado',
                        'informe_de_actividades': 'informe_de_actividades',
                        'certificado_de_calidad_contributiva': 'certificado_de_calidad_contributiva',
                        'copia_de_planilla_de_pago_seguridad_social': 'copia_de_planilla_de_pago_seguridad_social',
                        'rut': 'rut',
                        'rit': 'rit',
                        'capacitaciones_SST': 'capacitaciones_SST',
                        'acta_de_inicio': 'acta_de_inicio',
                        'certificado_de_cuenta_bancaria': 'certificado_de_cuenta_bancaria'
                        //..mapear todos los campos
                    };

                    if (fielMap[key]){
                        documentos[fielMap[key]] = files[key][0].buffer;
                    
                    }
                }); 
            }
            updateData.documentos = documentos;
            //actualizar el documento

            const documentoActualizado = await gestionDocumental.findByIdAndUpdate(
                id,
                updateData,
                {new: true, runValidators: true}
            ).select('-docuemntos');//Excluir buffers en la respuesta 
            
            res.status(200).json({
                success: true,
                message: 'Documento actualizado existosamente',
                data: documentoActualizado
            });
        }catch(error){
            res.status(500).json({
                success: false,
                message: 'Error al aactualizar el documento',
                error: error.message
            });
        }
    },
    /**
     * Eliminar un documento
     */
    eliminarDocumento: async (req, res)=>{
        try{
            const documentoEliminado = await gestionDocumental.findByIdAndDelete(req.params.id);

            if(!documentoEliminado){
                return res.status(404).json({
                    success: false,
                    message: 'Documento no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Documento eliminado existosamente'
            });
        }catch(error){
            res.status(500).json({
                success: false,
                message: 'Error al eliminar el documento',
                error: error.message
            });
        }
    },
    
    /**
     * Listar documentos (sin archivos por rendimiento)
     */
    listarDocumentos: async (req, res) =>{
        try {
            const {page = 1, limit = 10 } = req.query;
            const documentos = await gestionDocumental.find()
                .populate('gestion_de_contratos_id')
                .select('-documentos')//excluir los buffers
                .skip((page) - 1*limit)
                .limit(parseInt(limit))
                .sort({fecha_de_creacion: -1});
            const total = await gestionDocumental.countDocuments();

            res.status(200).json({
                success: true,
                data: documentos,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total/limit)
                }
            });
        }catch(error){
            res.status(500).json({
                success: false,
                message: 'Error al listar los documentos',
                error: error.message
            });
        }
    }
};

module.exports = gestionDocumentalController;