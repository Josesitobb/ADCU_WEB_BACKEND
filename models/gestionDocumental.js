const mongoose = require('mongoose');

const DocumentoSchema = new mongoose.Schema({
    titulo: String,
    descripcion: String,
    documentos: {
        type: Map,
        of: {
            originalname: String,
            mimetype: String,
            size: Number,
            buffer: Buffer,
            uploadedAt: Date,
            fieldname: String
        }
    },
    fecha_creacion: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GestionDocumental', DocumentoSchema);
