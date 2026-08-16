const express = require('express');
const router = express.Router();
const { fetchExternalPlaceData } = require('../services/externalApiService');
const { calculateCrowdPrediction } = require('../services/predictionEngine');
const { dbQuery } = require('../db');

// Real OpenStreetMap & Google Places Integration with Multi-Source Fused Predictions
router.get('/nearby', async (req, res) => {
  const { lat, lng, query } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ success: false, message: "Latitude and Longitude are required" });
  }

  try {
    // 1. Fetch baseline places from External API (Google Places API / Overpass OSM)
    const rawPlaces = await fetchExternalPlaceData(lat, lng, query);

    // 2. Enrich each place using the Unified Prediction Engine
    const enrichedPlaces = await Promise.all(
      rawPlaces.map(async (place) => {
        const userReports = await dbQuery(
          `SELECT * FROM user_reports WHERE place_id = ? ORDER BY timestamp DESC LIMIT 15`,
          [place.id]
        );

        const prediction = await calculateCrowdPrediction(place, userReports);

        return {
          ...place,
          crowdLevel: prediction.crowdLevel,
          waitTime: prediction.estimatedWaitTime,
          confidence: prediction.confidence,
          busynessScore: prediction.calculatedBusyness,
          sourcesBreakdown: prediction.breakdown,
        };
      })
    );

    res.json({ success: true, count: enrichedPlaces.length, data: enrichedPlaces });
  } catch (error) {
    console.error("Places API Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch nearby places" });
  }
});

module.exports = router;