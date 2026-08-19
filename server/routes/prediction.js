const express = require('express');
const router = express.Router();
const { dbQuery } = require('../db');
const { calculateCrowdPrediction } = require('../services/predictionEngine');
const { fetchExternalPlaceData } = require('../services/externalApiService');

/**
 * 🤖 Unified Prediction Route
 * Aggregates External API + User Reports + AI Web Scraper + Demo Seeded Data
 */

// GET /api/prediction/place/:placeId - Get full multi-source fused prediction details
router.get('/place/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;
    const { name = 'Selected Location', lat = '28.6139', lng = '77.2090' } = req.query;

    // Fetch user reports from SQLite
    const userReports = await dbQuery(
      `SELECT * FROM user_reports WHERE place_id = ? ORDER BY timestamp DESC LIMIT 20`,
      [placeId]
    );

    const placeObj = {
      id: placeId,
      name,
      baselineBusyness: Math.abs(placeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 60 + 25
    };

    const prediction = await calculateCrowdPrediction(placeObj, userReports);

    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    console.error('Prediction API Error:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate prediction' });
  }
});

module.exports = router;
