const Data = require('../models/Data');

exports.createData = async (req, res) => {
    try {
        const newData = await Data.create(req.body);
        res.status(201).json(newData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDataByCategory = async (req, res) => {
    try {
        const data = await Data.find({ category: req.params.category });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};