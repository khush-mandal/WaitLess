const express = require('express');
const router = express.Router();

// Real OpenStreetMap (Overpass API) Integration
router.get('/nearby', async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ success: false, message: "Latitude and Longitude are required" });
  }

  try {
    // 2km radius ke andar amenities search karne ke liye Overpass Query
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node(around:2000,${lat},${lng})["amenity"];out 15;`;

    const response = await fetch(overpassUrl);
    const data = await response.json();

    // Map Overpass results to WaitLess Schema
    const places = data.elements
      .filter((item) => item.tags && item.tags.name)
      .map((item, index) => {
        const crowdLevels = ["Low", "Moderate", "High"];
        const crowd = crowdLevels[index % 3];
        const wait = crowd === "Low" ? "5m" : crowd === "Moderate" ? "15m" : "35m";

        return {
          id: item.id,
          name: item.tags.name,
          category: item.tags.amenity,
          crowdLevel: crowd,
          waitTime: wait,
          confidence: "85%",
          lat: item.lat,
          lng: item.lon,
        };
      });

    res.json({ success: true, data: places });
  } catch (error) {
    console.error("Overpass API Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch nearby places" });
  }
});

module.exports = router;