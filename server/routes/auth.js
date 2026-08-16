const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/User');
const Preference = require('../models/Preference');
const Analytics = require('../models/Analytics');

const {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  authRateLimiter,
  authenticateToken,
  logAuditEvent,
  sanitizeAuthInput
} = require('../middleware/auth');

// Helper to generate access & refresh tokens
const generateTokens = (user) => {
  const payload = {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user._id.toString() }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};

// 📝 1. POST /api/auth/signup - Register new user account
router.post('/signup', authRateLimiter, async (req, res) => {
  try {
    const { name, email, password, role = 'customer' } = req.body;

    const { cleanEmail, isEmailValid, isPasswordValid } = sanitizeAuthInput(email, password);

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please provide a valid name (minimum 2 characters).' });
    }
    if (!isEmailValid) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const validRoles = ['customer', 'business_owner', 'admin'];
    const assignedRole = validRoles.includes(role) ? role : 'customer';

    let existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      await logAuditEvent({ email: cleanEmail, action: 'SIGNUP', status: 'FAILED', req, details: 'Email already registered' });
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(20).toString('hex');

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: assignedRole,
      verificationToken
    });

    await Preference.create({
      userId: newUser._id
    });

    if (assignedRole === 'business_owner') {
      await Analytics.create({
        ownerUserId: newUser._id,
        placeId: `venue_owner_${newUser._id.toString().slice(-6)}`,
        placeName: `${newUser.name}'s Venue`,
        totalVisitorsToday: 180,
        peakWaitTime: 20,
        averageRating: 4.7,
        customerSatisfactionPercent: 94,
        hourlyTrends: [
          { hour: 9, busyness: 20 },
          { hour: 12, busyness: 85 },
          { hour: 15, busyness: 40 },
          { hour: 18, busyness: 90 },
          { hour: 21, busyness: 30 }
        ]
      });
    }

    const { accessToken, refreshToken } = generateTokens(newUser);

    newUser.refreshTokens.push({ token: refreshToken });
    await newUser.save();

    await logAuditEvent({ userId: newUser._id, email: cleanEmail, action: 'SIGNUP', status: 'SUCCESS', req });

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      accessToken,
      refreshToken,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        bio: newUser.bio,
        avatarUrl: newUser.avatarUrl,
        points: newUser.points,
        reportsCount: newUser.reportsCount,
        streak: newUser.streak,
        badges: newUser.badges,
        isVerified: newUser.isVerified
      }
    });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ success: false, message: 'Server error during account registration.' });
  }
});

// 🔑 2. POST /api/auth/login - Authenticate user & issue tokens
router.post('/login', authRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const { cleanEmail, isEmailValid } = sanitizeAuthInput(email, password);

    if (!isEmailValid || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      await logAuditEvent({ email: cleanEmail, action: 'LOGIN_FAILED', status: 'FAILED', req, details: 'User not found' });
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logAuditEvent({ userId: user._id, email: cleanEmail, action: 'LOGIN_FAILED', status: 'FAILED', req, details: 'Password mismatch' });
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshTokens = user.refreshTokens.slice(-4);
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    await logAuditEvent({ userId: user._id, email: cleanEmail, action: 'LOGIN_SUCCESS', status: 'SUCCESS', req });

    res.json({
      success: true,
      message: 'Login successful!',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        points: user.points,
        reportsCount: user.reportsCount,
        streak: user.streak,
        badges: user.badges,
        timeSavedHours: user.timeSavedHours,
        peopleHelped: user.peopleHelped,
        impactScore: user.impactScore,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// 🔄 3. POST /api/auth/refresh-token - Refresh expired Access JWT
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired refresh token.' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User associated with token not found.' });
    }

    const tokenExists = user.refreshTokens.some(t => t.token === refreshToken);
    if (!tokenExists) {
      return res.status(403).json({ success: false, message: 'Refresh token is no longer active.' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
    user.refreshTokens.push({ token: newRefreshToken });
    await user.save();

    res.json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error('Refresh Token Error:', error);
    res.status(500).json({ success: false, message: 'Server error refreshing session.' });
  }
});

// 🚪 4. POST /api/auth/logout - Invalidate user session
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = await User.findById(req.user.id);
    if (user && refreshToken) {
      user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
      await user.save();
    }

    await logAuditEvent({ userId: req.user.id, email: req.user.email, action: 'LOGOUT', status: 'SUCCESS', req });

    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Logout failed.' });
  }
});

// 📩 5. POST /api/auth/forgot-password - Generate password reset token
router.post('/forgot-password', authRateLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const { cleanEmail, isEmailValid } = sanitizeAuthInput(email, '');

    if (!isEmailValid) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been generated.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
    await user.save();

    await logAuditEvent({ userId: user._id, email: cleanEmail, action: 'PASSWORD_RESET_REQUEST', status: 'SUCCESS', req });

    res.json({
      success: true,
      message: 'Password reset link generated.',
      resetToken,
      resetUrl: `/reset-password?token=${resetToken}`
    });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ success: false, message: 'Failed to process password reset request.' });
  }
});

// 🔐 6. POST /api/auth/reset-password - Set new password
router.post('/reset-password', authRateLimiter, async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Token and new password (min 6 chars) are required.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.refreshTokens = [];
    await user.save();

    await logAuditEvent({ userId: user._id, email: user.email, action: 'PASSWORD_RESET_SUCCESS', status: 'SUCCESS', req });

    res.json({ success: true, message: 'Password reset successfully! You can now log in with your new password.' });

  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
});

// ✅ 7. GET /api/auth/verify-email/:token - Verify user email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email verification token.' });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to verify email.' });
  }
});

// 👤 8. GET /api/auth/me - Get currently authenticated user data
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshTokens -resetPasswordToken');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user data.' });
  }
});

module.exports = router;
