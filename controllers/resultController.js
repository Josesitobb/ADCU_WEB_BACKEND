const Result = require('../models/Result');
const Data = require('../models/Data');

exports.generateResult = async (req, res) => {
    try {
        const { dataId, analysisType } = req.body;
        const data = await Data.findById(dataId);
        
        let calculatedValue;
        if (analysisType === 'promedio') {
            calculatedValue = data.value * 0.9; // Ejemplo simplificado
        }

        const newResult = await Result.create({ dataId, analysisType, value: calculatedValue });
        res.status(201).json(newResult);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};