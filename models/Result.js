const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    dataId: { type: mongoose.Schema.Types.ObjectId, ref: 'Data' },
    analysisType: { type: String, enum: ['promedio', 'sumatoria', 'tendencia'] },
    value: { type: Number, required: true },
    generatedAt: { type: Date, default: Date.now }
}, { versionKey: false });

module.exports = mongoose.model('Result', resultSchema);