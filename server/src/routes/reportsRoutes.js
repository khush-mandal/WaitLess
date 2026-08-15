const express = require('express');
const { createReport, listReports, getReportsForPlace } = require('../controllers/reportsController');

const router = express.Router();

router.get('/place/:placeId', getReportsForPlace);
router.get('/', listReports);
router.post('/', createReport);

module.exports = router;
