const mongoose = require('mongoose');
const { Schema } = mongoose;

const reportSchema = new Schema({
  type: {
    type: String,
    enum: ['PDF', 'Excel', 'CSV'],
    required: [true, 'El tipo de reporte es requerido'],
    trim: true
  },
  dataRange: {
    type: String,
    maxlength: [50, 'El rango no debe exceder 50 caracteres'],
    trim: true
  },
  filePath: {
    type: String,
    required: [true, 'La ruta del archivo es requerida'],
    trim: true
  },
  generatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario generador es requerido']
  },
  status: {
    type: String,
    enum: ['pendiente', 'completado', 'fallido'],
    default: 'pendiente',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimización
reportSchema.index({ type: 1 }, { name: 'idx_report_type' });
reportSchema.index({ generatedBy: 1 }, { name: 'idx_report_generator' });
reportSchema.index({ status: 1 }, { name: 'idx_report_status' });

// Middleware (hooks) de Mongoose
reportSchema.pre('validate', function(next) {
  if (!this.filePath && this.type) {
    this.filePath = `/reports/${this.type.toLowerCase()}_${Date.now()}.${this.type.toLowerCase()}`;
  }
  next();
});

reportSchema.post('save', function(doc, next) {
  console.log(`Nuevo reporte creado: ID ${doc._id}`);
  next();
});

// Virtual para la relación con User
reportSchema.virtual('generator', {
  ref: 'User',
  localField: 'generatedBy',
  foreignField: '_id',
  justOne: true
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;