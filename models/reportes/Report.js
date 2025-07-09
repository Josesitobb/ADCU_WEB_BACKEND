const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'El tipo de reporte es requerido'],
    enum: {
      values: ['Comparativo', 'Individual', 'Consolidado'],
      message: 'Tipo de reporte no válido'
    },
    default: 'Comparativo'
  },
  status: {
    type: String,
    enum: ['pendiente', 'completado', 'rechazado'],
    default: 'pendiente'
  },
  dataRange: {
    type: String,
    required: [true, 'El rango de fechas es requerido'],
    match: [/^\w+\s\d{4}$/, 'Formato debe ser "Mes Año" (ej: Enero 2025)']
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // ✅ Eliminado "required: true" para permitir valores nulos
  },
  filePath: {
    type: String,
    default: ''
  },
  firmas: {
    contratista: {
      type: String,
      required: [true, 'Nombre del contratista es requerido'],
      trim: true
    },
    supervisorInicio: {
      type: String,
      required: [true, 'Supervisor de inicio es requerido'],
      trim: true
    },
    supervisorOtros: {
      type: String,
      required: [true, 'Supervisor secundario es requerido'],
      trim: true
    }
  },
  fechas: {
    actaInicio: {
      type: Date,
      required: [true, 'Fecha de acta de inicio es requerida']
    },
    certificado: {
      type: Date,
      required: [true, 'Fecha de certificado es requerida'],
      validate: {
        validator: function(value) {
          return value >= this.fechas.actaInicio;
        },
        message: 'Fecha de certificado debe ser posterior al acta de inicio'
      }
    }
  },
  datosContratista: {
    nombre: {
      type: String,
      required: [true, 'Nombre del contratista es requerido'],
      trim: true
    },
    identificacion: {
      type: String,
      required: [true, 'Identificación es requerida'],
      match: [/^[0-9]{6,12}$/, 'Formato de identificación inválido']
    },
    contrato: {
      type: String,
      required: [true, 'Número de contrato es requerido'],
      match: [/^[0-9-]+/, 'Formato de contrato inválido']
    }
  },
  soportes: [{
    type: String,
    enum: ['RIT', 'Planilla', 'RUT', 'CertificadoCuenta', 'Otro']
  }],
  valores: {
    totalContrato: {
      type: Number,
      required: [true, 'Valor total del contrato es requerido'],
      min: [0, 'El valor no puede ser negativo']
    },
    primerPago: {
      type: Number,
      required: [true, 'Valor del primer pago es requerido'],
      min: [0, 'El valor no puede ser negativo'],
      validate: {
        validator: function(value) {
          return value <= this.valores.totalContrato;
        },
        message: 'El primer pago no puede exceder el valor total'
      }
    }
  },
  observaciones: {
    firma: {
      type: String,
      maxlength: [500, 'Máximo 500 caracteres']
    },
    fechas: {
      type: String,
      maxlength: [500, 'Máximo 500 caracteres']
    },
    identificacion: {
      type: String,
      maxlength: [500, 'Máximo 500 caracteres']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices útiles
reportSchema.index({ type: 1 });
reportSchema.index({ 'datosContratista.identificacion': 1 });
reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
