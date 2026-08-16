const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    placeId: {
      type: String,
      required: true,
      index: true
    },
    placeName: {
      type: String,
      default: 'Local Venue'
    },
    sector: {
      type: String,
      default: 'hospitality'
    },
    crowdLevel: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'low', 'medium', 'high'],
      required: true
    },
    waitTimeMins: {
      type: Number,
      default: 15
    },
    trustScore: {
      type: Number,
      default: 1.0
    },
    notes: {
      type: String,
      default: ''
    },
    pointsEarned: {
      type: Number,
      default: 15
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Report || mongoose.model('Report', reportSchema);
