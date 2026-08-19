const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    ownerUserId: {
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
      required: true
    },
    totalVisitorsToday: {
      type: Number,
      default: 420
    },
    peakWaitTime: {
      type: Number,
      default: 25
    },
    averageRating: {
      type: Number,
      default: 4.8
    },
    customerSatisfactionPercent: {
      type: Number,
      default: 92
    },
    hourlyTrends: [
      {
        hour: { type: Number, required: true },
        busyness: { type: Number, required: true }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);
