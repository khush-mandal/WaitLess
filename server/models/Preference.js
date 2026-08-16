const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    savedPlaces: {
      type: [String],
      default: []
    },
    distanceUnit: {
      type: String,
      enum: ['miles', 'km'],
      default: 'miles'
    },
    crowdAlerts: {
      type: Boolean,
      default: true
    },
    weeklyDigest: {
      type: Boolean,
      default: true
    },
    defaultSector: {
      type: String,
      default: 'all'
    },
    anonymousReporting: {
      type: Boolean,
      default: false
    },
    preciseLocation: {
      type: Boolean,
      default: true
    },
    dataSharing: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Preference || mongoose.model('Preference', preferenceSchema);
