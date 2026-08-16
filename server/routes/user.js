const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Preference = require('../models/Preference');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// 👤 GET /api/user/profile - Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshTokens');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving user profile.' });
  }
});

// ✏️ PUT /api/user/profile - Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { name, bio, avatarUrl } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl) user.avatarUrl = avatarUrl;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        points: user.points,
        reportsCount: user.reportsCount,
        streak: user.streak,
        badges: user.badges
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating user profile.' });
  }
});

// ⚙️ GET /api/user/preferences - Get user preferences & saved places
router.get('/preferences', async (req, res) => {
  try {
    let pref = await Preference.findOne({ userId: req.user.id });
    if (!pref) {
      pref = await Preference.create({ userId: req.user.id });
    }
    res.json({ success: true, data: pref });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching preferences.' });
  }
});

// ⚙️ PUT /api/user/preferences - Update user preferences or saved places
router.put('/preferences', async (req, res) => {
  try {
    const { savedPlaces, distanceUnit, crowdAlerts, weeklyDigest, defaultSector, anonymousReporting, preciseLocation, dataSharing } = req.body;

    let pref = await Preference.findOne({ userId: req.user.id });
    if (!pref) {
      pref = new Preference({ userId: req.user.id });
    }

    if (savedPlaces !== undefined) pref.savedPlaces = savedPlaces;
    if (distanceUnit !== undefined) pref.distanceUnit = distanceUnit;
    if (crowdAlerts !== undefined) pref.crowdAlerts = crowdAlerts;
    if (weeklyDigest !== undefined) pref.weeklyDigest = weeklyDigest;
    if (defaultSector !== undefined) pref.defaultSector = defaultSector;
    if (anonymousReporting !== undefined) pref.anonymousReporting = anonymousReporting;
    if (preciseLocation !== undefined) pref.preciseLocation = preciseLocation;
    if (dataSharing !== undefined) pref.dataSharing = dataSharing;

    await pref.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully!',
      data: pref
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating preferences.' });
  }
});

module.exports = router;
