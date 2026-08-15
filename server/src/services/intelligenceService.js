const LEVEL_ORDER = ['low', 'medium', 'high'];
const LEVEL_SCORE = { low: 1, medium: 2, high: 3 };
const WAIT_BUCKETS = [
  { max: 5, label: '0–5 min' },
  { max: 15, label: '5–15 min' },
  { max: 30, label: '15–30 min' },
  { max: Number.MAX_SAFE_INTEGER, label: '30+ min' },
];

function normalizeReport(report) {
  if (!report) return null;
  const crowdLevel = String(report.crowd_level ?? report.crowdLevel ?? '').toLowerCase();
  const createdAt = report.created_at ?? report.createdAt ?? null;
 if (!crowdLevel || !LEVEL_ORDER.includes(crowdLevel) || !createdAt) {
    return null;
  }

  const waitValue = report.estimated_wait_minutes ?? report.estimatedWaitMinutes ?? null;

  return {
    crowd_level: crowdLevel,
    created_at: createdAt,
    estimated_wait_minutes: waitValue != null && Number.isFinite(Number(waitValue)) ? Number(waitValue) : null,
  };
}

function getRecentReports(reports, limit = 10) {
  return (reports || [])
    .map(normalizeReport)
    .filter(Boolean)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
}

function calculateTrend(reports) {
  const recent = getRecentReports(reports, 5);
  if (recent.length < 3) return 'insufficient_data';

  const values = recent.map((report) => LEVEL_SCORE[report.crowd_level]);
  const earliest = values[values.length - 1];
  const latest = values[0];

  if (latest > earliest + 1) return 'increasing';
  if (latest < earliest - 1) return 'decreasing';
  return 'stable';
}

function determineCrowdLevel(reports) {
  const recent = getRecentReports(reports, 10);
  if (recent.length === 0) {
    return 'insufficient_data';
  }

  if (recent.length === 1) {
    return recent[0].crowd_level;
  }

  const weightedScore = recent.reduce((total, report, index) => {
    const weight = recent.length - index;
    return total + LEVEL_SCORE[report.crowd_level] * weight;
  }, 0);

  const totalWeight = recent.reduce((total, _report, index) => total + (recent.length - index), 0);
  const average = weightedScore / totalWeight;

  if (average >= 2.5) return 'high';
  if (average >= 1.5) return 'medium';
  return 'low';
}

function determineWaitRange(waitValues) {
  const valid = (waitValues || []).filter((value) => {
    return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0;
  });

  if (valid.length === 0) {
    return { min: null, max: null, label: 'insufficient_data' };
  }

  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const label = min === max ? `${min} min` : `${min}–${max} min`;

  return {
    min,
    max,
    label,
  };
}

function determineConfidence(reports) {
  const recent = getRecentReports(reports, 10);
  if (recent.length === 0) return 'low';
  if (recent.length === 1) return 'low';

  const scores = recent.map((report) => LEVEL_SCORE[report.crowd_level] || 0);
  const spread = Math.max(...scores) - Math.min(...scores);

  if (recent.length >= 3 && spread <= 1) return 'high';
  if (recent.length >= 2 && spread <= 2) return 'medium';
  return 'low';
}

function buildBestTimeRecommendation(reports) {
  const recent = getRecentReports(reports, 20);
  if (recent.length < 4) {
    return {
      available: false,
      label: null,
      reason: 'Not enough historical observations yet.',
    };
  }

  const buckets = {};
  recent.forEach((report) => {
    const hour = new Date(report.created_at).getHours();
    const bucketKey = Math.floor(hour / 2) * 2;
    if (!buckets[bucketKey]) {
      buckets[bucketKey] = { total: 0, score: 0, count: 0 };
    }
    buckets[bucketKey].total += 1;
    buckets[bucketKey].score += LEVEL_SCORE[report.crowd_level];
    buckets[bucketKey].count += 1;
  });

  const bestWindow = Object.entries(buckets)
    .sort((a, b) => (a[1].score / a[1].count) - (b[1].score / b[1].count))[0];

  if (!bestWindow) {
    return {
      available: false,
      label: null,
      reason: 'Not enough historical observations yet.',
    };
  }

  const startHour = Number(bestWindow[0]);
  const endHour = Math.min(23, startHour + 1);
  const label = `${String(startHour).padStart(2, '0')}:00–${String(endHour).padStart(2, '0')}:00`;

  return {
    available: true,
    label,
    reason: 'Based on recent reports from this place.',
  };
}

function buildPlaceIntelligence(place, reports) {
  const recent = getRecentReports(reports, 10);

  if (recent.length === 0) {
    return {
      placeId: place?.id || null,
      predictedCrowdLevel: 'insufficient_data',
      predictedWaitRange: { min: null, max: null, label: 'insufficient_data' },
      trend: 'insufficient_data',
      confidence: 'low',
      reportsUsed: 0,
      bestTime: {
        available: false,
        label: null,
        reason: 'Not enough historical observations yet.',
      },
      explanation: 'Not enough crowd reports are available yet.',
    };
  }

  const crowdLevel = determineCrowdLevel(recent);
  const waitRange = determineWaitRange(recent.map((report) => report.estimated_wait_minutes));
  const trend = calculateTrend(recent);
  const confidence = determineConfidence(recent);

  let explanation = 'Recent reports show consistent crowd activity.';
  if (trend === 'increasing') explanation = 'Recent reports are trending higher than earlier reports.';
  if (trend === 'decreasing') explanation = 'Recent reports are trending lower than earlier reports.';
  if (trend === 'stable') explanation = 'Recent reports are consistent and indicate a stable crowd.';
  if (recent.length === 1) explanation = 'Only one recent report is available, so confidence is low.';
  if (confidence === 'low' && recent.length > 1) explanation = 'Recent reports are mixed, so the estimate has low confidence.';

  return {
    placeId: place?.id || null,
    predictedCrowdLevel: crowdLevel,
    predictedWaitRange: waitRange,
    trend,
    confidence,
    reportsUsed: recent.length,
    bestTime: buildBestTimeRecommendation(reports),
    explanation,
  };
}

module.exports = {
  LEVEL_ORDER,
  LEVEL_SCORE,
  normalizeReport,
  getRecentReports,
  calculateTrend,
  determineCrowdLevel,
  determineWaitRange,
  determineConfidence,
  buildBestTimeRecommendation,
  buildPlaceIntelligence,
};
