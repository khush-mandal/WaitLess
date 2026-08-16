const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const Report = require('../models/Report');
const User = require('../models/User');
const { dbRun, dbQuery, dbGet } = require('../db');
const { calculateCrowdPrediction } = require('../services/predictionEngine');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

/**
 * 👥 User-Generated Crowd Reports & MongoDB Atlas Datasets
 */

// 🔒 1. GET /api/reports/my - Fetch personalized crowd reports for logged-in user
// (Must be defined BEFORE /place/:placeId to avoid route collision)
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const mongoReports = await Report.find({ userId: req.user.id }).sort({ createdAt: -1 });

    const formattedReports = mongoReports.map(r => ({
      id: r._id.toString(),
      placeId: r.placeId,
      placeName: r.placeName,
      sector: r.sector,
      crowdLevel: r.crowdLevel,
      waitTimeMins: r.waitTimeMins,
      notes: r.notes,
      timestamp: r.createdAt ? new Date(r.createdAt).toLocaleString() : 'Recently',
      pointsEarned: r.pointsEarned,
      iconName: r.sector === 'retail' ? 'shopping_cart' : 'storefront'
    }));

    res.json({
      success: true,
      count: formattedReports.length,
      data: formattedReports
    });
  } catch (error) {
    console.error('Error fetching personal reports:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch personal reports' });
  }
});

// 2. POST /api/reports - Submit a live crowd report with Gamification rewards & MongoDB persistence
router.post('/', async (req, res) => {
  try {
    const { placeId, placeName, sector = 'hospitality', crowdLevel, waitTimeMins = 15, notes = '' } = req.body;

    if (!placeId || !crowdLevel) {
      return res.status(400).json({ success: false, message: 'placeId and crowdLevel are required' });
    }

    let authUserId = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        authUserId = decoded.id;
      } catch (e) {
        // Token invalid or expired
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    let mongoReport = null;
    let newPoints = 15;
    let newStreak = 1;
    let userBadges = ['Rookie Scout'];

    if (authUserId) {
      const user = await User.findById(authUserId);
      if (user) {
        user.points = (user.points || 0) + 15;
        user.reportsCount = (user.reportsCount || 0) + 1;
        user.peopleHelped = (user.peopleHelped || 0) + 45;
        user.impactScore = Math.min(100, (user.impactScore || 0) + 1);
        
        let newTimeSaved = user.timeSavedHours || "0h 0m";
        let hours = parseInt(newTimeSaved.match(/(\d+)h/)?.[1] || 0);
        let mins = parseInt(newTimeSaved.match(/(\d+)m/)?.[1] || 0);
        mins += 5;
        if (mins >= 60) {
          hours += Math.floor(mins / 60);
          mins = mins % 60;
        }
        user.timeSavedHours = `${hours}h ${mins}m`;

        if (user.lastReportDate !== todayStr) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          if (user.lastReportDate === yesterday) {
            user.streak = (user.streak || 1) + 1;
          } else {
            user.streak = 1;
          }
          user.lastReportDate = todayStr;
        }

        if (user.reportsCount >= 5 && !user.badges.includes('Crowd Buster')) user.badges.push('Crowd Buster');
        if (user.streak >= 3 && !user.badges.includes('Streak Master')) user.badges.push('Streak Master');
        if (user.points >= 100 && !user.badges.includes('Community Hero')) user.badges.push('Community Hero');

        await user.save();

        newPoints = user.points;
        newStreak = user.streak;
        userBadges = user.badges;

        mongoReport = await Report.create({
          userId: user._id,
          placeId,
          placeName: placeName || 'Venue',
          sector,
          crowdLevel,
          waitTimeMins: parseInt(waitTimeMins),
          notes,
          pointsEarned: 15,
          timestamp: new Date()
        });
      }
    }

    await dbRun(`
      INSERT INTO user_reports (place_id, place_name, user_id, crowd_level, wait_time_mins, trust_score, notes, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [placeId, placeName || 'Venue', authUserId || 'anonymous', crowdLevel, parseInt(waitTimeMins), 1.0, notes, Date.now()]);

    const reportsForPlace = await dbQuery(
      `SELECT * FROM user_reports WHERE place_id = ? ORDER BY timestamp DESC LIMIT 20`,
      [placeId]
    );
    const updatedPrediction = await calculateCrowdPrediction(
      { id: placeId, name: placeName, baselineBusyness: 50 },
      reportsForPlace
    );

    res.json({
      success: true,
      message: 'Report submitted successfully!',
      report: mongoReport,
      reward: {
        pointsEarned: 15,
        totalPoints: newPoints,
        streak: newStreak,
        badges: userBadges
      },
      updatedPrediction
    });

  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ success: false, message: 'Failed to submit report' });
  }
});

// 3. GET /api/reports/place/:placeId - Get recent reports for a venue
router.get('/place/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;
    const mongoReports = await Report.find({ placeId }).sort({ createdAt: -1 }).limit(20);

    if (mongoReports && mongoReports.length > 0) {
      return res.json({ success: true, count: mongoReports.length, data: mongoReports });
    }

    const sqliteReports = await dbQuery(
      `SELECT * FROM user_reports WHERE place_id = ? ORDER BY timestamp DESC LIMIT 20`,
      [placeId]
    );
    res.json({ success: true, count: sqliteReports.length, data: sqliteReports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch venue reports' });
  }
});

// 4. GET /api/reports/leaderboard - Community leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const topUsers = await User.find()
      .select('name email points reportsCount streak badges avatarUrl')
      .sort({ points: -1 })
      .limit(10);

    if (topUsers && topUsers.length > 0) {
      const leaderboard = topUsers.map(u => ({
        user_id: u._id,
        username: u.name,
        points: u.points,
        reports_count: u.reportsCount,
        streak: u.streak,
        badges: u.badges,
        avatarUrl: u.avatarUrl
      }));
      return res.json({ success: true, data: leaderboard });
    }

    const sqliteReporters = await dbQuery(
      `SELECT user_id, username, points, reports_count, streak, badges FROM user_profiles ORDER BY points DESC LIMIT 10`
    );
    res.json({ success: true, data: sqliteReporters });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
