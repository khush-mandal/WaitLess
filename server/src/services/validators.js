const CROWD_LEVELS = ['low', 'medium', 'high'];
const CROWD_HISTORY_LEVELS = ['low', 'medium', 'high', 'unknown'];

function isValidCrowdLevel(level) {
  return CROWD_LEVELS.includes(level);
}

function isValidCrowdHistoryLevel(level) {
  return CROWD_HISTORY_LEVELS.includes(level);
}

function validateCrowdReport({ placeId, crowdLevel, waitTimeMinutes, pointsEarned }) {
  const errors = [];

  if (!placeId || typeof placeId !== 'string' || placeId.trim() === '') {
    errors.push('placeId is required');
  }

  if (!isValidCrowdLevel(crowdLevel)) {
    errors.push('crowdLevel must be one of: low, medium, high');
  }

  if (
    waitTimeMinutes != null &&
    (!Number.isInteger(Number(waitTimeMinutes)) || Number(waitTimeMinutes) < 0 || Number(waitTimeMinutes) > 600)
  ) {
    errors.push('waitTimeMinutes must be a non-negative integer between 0 and 600');
  }

  if (pointsEarned != null && (typeof pointsEarned !== 'number' || pointsEarned < 0)) {
    errors.push('pointsEarned must be a non-negative number');
  }

  return errors;
}

module.exports = {
  CROWD_LEVELS,
  CROWD_HISTORY_LEVELS,
  isValidCrowdLevel,
  isValidCrowdHistoryLevel,
  validateCrowdReport,
};
