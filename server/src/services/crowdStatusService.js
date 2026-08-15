const VALID_LEVELS = ['low', 'medium', 'high'];
const LEVEL_SCORES = { low: 1, medium: 2, high: 3 };

function normalizeReport(report) {
  if (!report) return null;

  const crowdLevel = String(report.crowd_level ?? report.crowdLevel ?? '').toLowerCase();
  const createdAt = report.created_at ?? report.createdAt ?? null;

  if (!VALID_LEVELS.includes(crowdLevel) || !createdAt) {
    return null;
  }

  return {
    crowd_level: crowdLevel,
    created_at: createdAt,
  };
}

function getStatusLabel(crowdLevel) {
  if (crowdLevel === 'high') return 'Very Busy';
  if (crowdLevel === 'medium') return 'Moderate';
  return 'Not Busy';
}

function calculateCurrentCrowdStatus(reports, options = {}) {
  const windowMinutes = Number(options.windowMinutes ?? 1440);
  const safeReports = (reports || [])
    .map(normalizeReport)
    .filter(Boolean)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (safeReports.length === 0) {
    return {
      crowdLevel: 'low',
      statusLabel: 'No recent reports',
      confidence: 0,
      reportCount: 0,
      reportsUsed: 0,
      windowMinutes,
      latestReportAt: null,
      summary: 'No recent crowd reports available for this place.',
    };
  }

  const cutoff = new Date(Date.now() - windowMinutes * 60_000);
  const recentReports = safeReports.filter((report) => new Date(report.created_at) >= cutoff);
  const effectiveReports = recentReports.length > 0 ? recentReports : safeReports.slice(0, 5);

  const distinctLevels = [...new Set(effectiveReports.map((report) => report.crowd_level))];
  const levelScoreTotal = effectiveReports.reduce((total, report, index) => {
    const recencyWeight = 1 + (effectiveReports.length - index - 1) / Math.max(1, effectiveReports.length);
    return total + LEVEL_SCORES[report.crowd_level] * recencyWeight;
  }, 0);
  const recencyWeightTotal = effectiveReports.reduce((total, report, index) => {
    const recencyWeight = 1 + (effectiveReports.length - index - 1) / Math.max(1, effectiveReports.length);
    return total + recencyWeight;
  }, 0);

  const weightedAverage = levelScoreTotal / recencyWeightTotal;

  let crowdLevel = 'low';
  if (weightedAverage >= 2.5) {
    crowdLevel = 'high';
  } else if (weightedAverage >= 1.5) {
    crowdLevel = 'medium';
  }

  const agreementPenalty = Math.max(0, distinctLevels.length - 1) * 18;
  const countBoost = Math.min(30, effectiveReports.length * 10);
  const confidence = Math.max(0, Math.min(100, Math.round(countBoost + (100 - agreementPenalty) / 2)));

  return {
    crowdLevel,
    statusLabel: getStatusLabel(crowdLevel),
    confidence,
    reportCount: effectiveReports.length,
    reportsUsed: effectiveReports.length,
    windowMinutes,
    latestReportAt: effectiveReports[0]?.created_at || null,
    summary: `${effectiveReports.length} recent report(s) used to calculate the current crowd status.`,
    weightedAverage: Number(weightedAverage.toFixed(2)),
    distinctLevels,
  };
}

module.exports = {
  VALID_LEVELS,
  LEVEL_SCORES,
  calculateCurrentCrowdStatus,
  normalizeReport,
};
