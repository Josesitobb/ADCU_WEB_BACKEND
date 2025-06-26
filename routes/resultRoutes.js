const express = require('express');
const router = express.Router();
const { generateResult } = require('../controllers/resultController');

router.post('/generate', generateResult);

module.exports = router;