const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const validator = require('validator');

const JWT_SECRET = process.env.JWT_SECRET || 'waitless_super_secret_jwt_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'waitless_super_secret_refresh_key_2026';

// 🔒 1. Rate Limiting Middleware for Auth APIs (10 attempts per 15 mins)
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes'
  }
});

// 🛡️ 2. JWT Verification Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please refresh your session.'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// 👑 3. Role-Based Access Control (RBAC) Middleware
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User session missing.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' is not authorized to access this resource.`
      });
    }

    next();
  };
};

// 📑 4. Audit Logger Helper
const logAuditEvent = async ({ userId = null, email, action, status = 'SUCCESS', req, details = '' }) => {
  try {
    const AuditLog = require('../models/AuditLog');
    const ip = (req && (req.headers['x-forwarded-for'] || req.socket.remoteAddress)) || '127.0.0.1';
    const userAgent = (req && req.headers['user-agent']) || 'Unknown';

    await AuditLog.create({
      userId,
      email,
      action,
      status,
      ip,
      userAgent,
      details
    });
  } catch (err) {
    console.error('Audit logging error:', err.message);
  }
};

// 🧹 5. Input Sanitizer & Validator
const sanitizeAuthInput = (email, password) => {
  const cleanEmail = email ? validator.normalizeEmail(validator.trim(email)) : '';
  const isEmailValid = cleanEmail && validator.isEmail(cleanEmail);
  const isPasswordValid = password && password.length >= 6;

  return {
    cleanEmail,
    isEmailValid,
    isPasswordValid
  };
};

module.exports = {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  authRateLimiter,
  authenticateToken,
  requireRole,
  logAuditEvent,
  sanitizeAuthInput
};
