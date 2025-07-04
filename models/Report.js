// models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  firmas: {
    contratista: String,
    supervisorInicio: String,
    supervisorOtros: String
  },
  fechas: {
    actaInicio: Date,
    certificado: Date
  },
  datosContratista: {
    nombre: String,
    identificacion: String,
    contrato: String
  },
  soporte: [String],
  valores: {
    totalContrato: Number,
    primerPago: Number
  },
  observaciones: {
    firma: String,
    fechas: String,
    identificacion: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
