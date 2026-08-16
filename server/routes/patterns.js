const express = require('express');
const router = express.Router();
const patternsController = require('../controllers/patternsController');

// GET /api/patterns
// Query params expected: lat, lon, name
router.get('/', patternsController.getPatternData);

module.exports = router;
