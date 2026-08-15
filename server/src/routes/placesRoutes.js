const express = require('express');
const { getPlaces, getPlaceById, getPlaceCrowdStatus, getPlaceIntelligence, getPlaceRecommendation } = require('../controllers/placesController');

const router = express.Router();

router.get('/', getPlaces);
router.get('/:id/recommendation', getPlaceRecommendation);
router.get('/:id/intelligence', getPlaceIntelligence);
router.get('/:id/crowd', getPlaceCrowdStatus);
router.get('/:id', getPlaceById);

module.exports = router;
