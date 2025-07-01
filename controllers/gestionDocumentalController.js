const GestionDocumental = require('../models/gestionDocumental');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const gestionDocumentalController = {
    // Crear un nuevo documento con múltiples PDFs
    crearDocumento: async (req, res) => {
        try {
            const files = req.files;
            const body = req.body;
            const documentos = {};

            if (files && files.length > 0) {
                files.forEach(file => {
                    const docId = uuidv4();
                    documentos[docId] = {
                        buffer: file.buffer,
                        originalname: file.originalname,
                        mimetype: file.mimetype,
                        size: file.size,
                        uploadedAt: new Date(),
                        fieldname: file.fieldname
                    };
                });
            }

            const nuevoDocumento = new GestionDocumental({
                ...body,
                documentos
            });

            const guardado = await nuevoDocumento.save();

            res.status(201).json({
                success: true,
                message: 'Documento creado correctamente',
                data: guardado._id
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al crear documento',
                error: error.message
            });
        }
    },

    // Obtener un documento por ID (sin buffers)
    obtenerDocumento: async (req, res) => {
        try {
            const doc = await GestionDocumental.findById(req.params.id).select('-documentos');

            if (!doc) {
                return res.status(404).json({
                    success: false,
                    message: 'Documento no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                data: doc
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener documento',
                error: error.message
            });
        }
    },

    // Listar todos los documentos (sin archivos)
    listarDocumentos: async (req, res) => {
        try {
            const documentos = await GestionDocumental.find().select('-documentos');

            res.status(200).json({
                success: true,
                data: documentos
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al listar documentos',
                error: error.message
            });
        }
    },

    // Descargar archivo específico por docId
    descargarArchivo: async (req, res) => {
        try {
            const { id, docId } = req.params;
            const documento = await GestionDocumental.findById(id);

            if (!documento || !documento.documentos || !documento.documentos.get(docId)) {
                return res.status(404).json({
                    success: false,
                    message: 'Archivo no encontrado'
                });
            }

            const archivo = documento.documentos.get(docId);
            const filename = archivo.originalname || `archivo-${docId}${path.extname(archivo.originalname) || '.pdf'}`;

            res.setHeader('Content-Type', archivo.mimetype || 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(archivo.buffer);

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al descargar archivo',
                error: error.message
            });
        }
    },

    // Actualizar documento (puede subir más archivos)
    actualizarDocumento: async (req, res) => {
        try {
            const { id } = req.params;
            const body = req.body;
            const files = req.files;

            const docActual = await GestionDocumental.findById(id);
            if (!docActual) {
                return res.status(404).json({
                    success: false,
                    message: 'Documento no encontrado'
                });
            }

            const documentos = new Map(docActual.documentos);

            if (files && files.length > 0) {
                files.forEach(file => {
                    const docId = uuidv4();
                    documentos.set(docId, {
                        buffer: file.buffer,
                        originalname: file.originalname,
                        mimetype: file.mimetype,
                        size: file.size,
                        uploadedAt: new Date(),
                        fieldname: file.fieldname
                    });
                });
            }

            docActual.set({ ...body, documentos });
            const actualizado = await docActual.save();

            res.status(200).json({
                success: true,
                message: 'Documento actualizado',
                data: actualizado._id
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al actualizar documento',
                error: error.message
            });
        }
    },

    // Eliminar documento completo
    eliminarDocumento: async (req, res) => {
        try {
            const eliminado = await GestionDocumental.findByIdAndDelete(req.params.id);

            if (!eliminado) {
                return res.status(404).json({
                    success: false,
                    message: 'Documento no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Documento eliminado correctamente'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar documento',
                error: error.message
            });
        }
    },

    // Eliminar archivo específico de un documento
    eliminarArchivo: async (req, res) => {
        try {
            const { id, docId } = req.params;
            const documento = await GestionDocumental.findById(id);

            if (!documento || !documento.documentos.get(docId)) {
                return res.status(404).json({
                    success: false,
                    message: 'Archivo no encontrado'
                });
            }

            documento.documentos.delete(docId);
            await documento.save();

            res.status(200).json({
                success: true,
                message: 'Archivo eliminado exitosamente'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar archivo',
                error: error.message
            });
        }
    }
};

module.exports = gestionDocumentalController;
