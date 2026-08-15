const express = require('express');
const healthRoutes = require('./healthRoutes');
const placesRoutes = require('./placesRoutes');
const reportsRoutes = require('./reportsRoutes');

const router = express.Router();

router.use(healthRoutes);
router.use('/places', placesRoutes);
router.use('/reports', reportsRoutes);

module.exports = router;
