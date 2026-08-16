const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    email: {
      type: String,
      required: true
    },
    action: {
      type: String,
      enum: ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'SIGNUP', 'PASSWORD_RESET_REQUEST', 'PASSWORD_RESET_SUCCESS', 'LOGOUT'],
      required: true
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      default: 'SUCCESS'
    },
    ip: {
      type: String,
      default: '127.0.0.1'
    },
    userAgent: {
      type: String,
      default: 'Unknown'
    },
    details: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
