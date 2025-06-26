const express = require('express');
const router = express.Router();
const { createData, getDataByCategory } = require('../controllers/dataController');

router.post('/', createData);
router.get('/:category', getDataByCategory);

module.exports = router;