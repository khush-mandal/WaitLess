const express = require('express');
const router = express.Router();

const Analytics = require('../models/Analytics');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireRole('business_owner', 'admin'));

// 📊 GET /api/analytics/dashboard - Business Owner Analytics Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    let analytics = await Analytics.find({ ownerUserId: req.user.id });

    if (!analytics || analytics.length === 0) {
      const newAnalytics = await Analytics.create({
        ownerUserId: req.user.id,
        placeId: `venue_${req.user.id.toString().slice(-6)}`,
        placeName: `${req.user.name}'s Venue`,
        totalVisitorsToday: 340,
        peakWaitTime: 22,
        averageRating: 4.8,
        customerSatisfactionPercent: 95,
        hourlyTrends: [
          { hour: 8, busyness: 15 },
          { hour: 10, busyness: 45 },
          { hour: 12, busyness: 85 },
          { hour: 14, busyness: 50 },
          { hour: 17, busyness: 95 },
          { hour: 20, busyness: 40 }
        ]
      });
      analytics = [newAnalytics];
    }

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch business analytics.' });
  }
});

module.exports = router;
