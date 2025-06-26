const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    name: { type: String, required: true },
    value: { type: Number, required: true },
    category: { type: String, enum: ['ventas', 'inventario', 'usuarios'] },
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

module.exports = mongoose.model('Data', dataSchema);

