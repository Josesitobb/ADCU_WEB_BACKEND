const mongoose = require('mongoose')

const GestionDocumentalSchema = new mongoose.Schema({
  Fecha_De_Creacion: { type: Date, required: true },
  Tiempo_De_Retencion: { type: Number, required: true },
  Ip_De_Modificacion: { type: Number, required: true },
  Estado: { type: String, required: true },
  Descripcion: { type: String, required: true },
  VersionD: { type: String, required: true },
  Usuario_De_Creacion: { type: String, required: true },
  Usuario_De_Edicion: { type: String, required: true },

  // gestion_de_contratos: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'GestionContratos',
  //   required: true
  // },

  // Campos para documentos PDF como Buffer
  carta_radicacion_cuenta_de_cobro: Buffer,
  ceritificado_de_cumplimiento: Buffer,
  certificado_de_cumplimiento_firmado: Buffer,
  informes_de_actividades: Buffer,
  informe_de_actividades_firmado: Buffer,
  certificado_de_calidad_contributiva: Buffer,
  copia_de_planilla_pago_seguridad_social: Buffer,
  rut: Buffer,
  rit: Buffer,
  capacitaciones_SST: Buffer,
  acta_de_inicio: Buffer,
  certificado_de_cuenta: Buffer
}, {
  timestamps: true
});
module.exports = mongoose.model('GestionDocumental', GestionDocumentalSchema);