const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    bio: {
      type: String,
      default: 'Saving time & dodging crowd surges daily ⚡'
    },
    avatarUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    role: {
      type: String,
      enum: ['customer', 'business_owner', 'admin'],
      default: 'customer'
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String,
      default: null
    },
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    },
    refreshTokens: [
      {
        token: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    points: {
      type: Number,
      default: 0
    },
    reportsCount: {
      type: Number,
      default: 0
    },
    streak: {
      type: Number,
      default: 1
    },
    lastReportDate: {
      type: String,
      default: null
    },
    timeSavedHours: {
      type: String,
      default: '0h 0m'
    },
    peopleHelped: {
      type: Number,
      default: 0
    },
    impactScore: {
      type: Number,
      default: 0
    },
    badges: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
