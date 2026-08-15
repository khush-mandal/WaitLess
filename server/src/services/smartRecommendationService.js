const { buildPlaceIntelligence } = require('./intelligenceService');

const LEVEL_RANK = { low: 1, medium: 2, high: 3, insufficient_data: 99 };
const CONFIDENCE_RANK = { low: 1, medium: 2, high: 3 };
const MAX_STALE_MINUTES = 12 * 60;

function getWaitUpperBound(range) {
  if (!range || range.max == null || Number.isNaN(Number(range.max))) {
    return Number.POSITIVE_INFINITY;
  }

  return Number(range.max);
}

function getWaitLowerBound(range) {
  if (!range || range.min == null || Number.isNaN(Number(range.min))) {
    return Number.POSITIVE_INFINITY;
  }

  return Number(range.min);
}

function isLowEvidence(intelligence) {
  if (!intelligence) return true;
  if (!intelligence.predictedCrowdLevel || intelligence.predictedCrowdLevel === 'insufficient_data') return true;
  if (!intelligence.predictedWaitRange || intelligence.predictedWaitRange.label === 'insufficient_data') return true;
  if (intelligence.confidence === 'low') return true;
  if (intelligence.reportsUsed == null || Number(intelligence.reportsUsed) < 2) return true;
  return false;
}

function isStaleReport(intelligence) {
  if (!intelligence) return true;

  const bestTimeAvailable = intelligence.bestTime && intelligence.bestTime.available === true;
  const reportsUsed = Number(intelligence.reportsUsed || 0);

  if (!bestTimeAvailable && reportsUsed < 4) {
    return true;
  }

  if (Array.isArray(intelligence.recentReports) && intelligence.recentReports.length > 0) {
    const newest = intelligence.recentReports
      .map((report) => new Date(report.created_at).getTime())
      .filter((time) => Number.isFinite(time))
      .sort((a, b) => b - a)[0];

    if (Number.isFinite(newest) && Date.now() - newest > MAX_STALE_MINUTES * 60 * 1000) {
      return true;
    }
  }

  return false;
}

function isMeaningfullyBetter(current, candidate) {
  const currentWait = getWaitUpperBound(current?.predictedWaitRange);
  const candidateWait = getWaitUpperBound(candidate?.predictedWaitRange);
  const currentCrowd = LEVEL_RANK[current?.predictedCrowdLevel] || LEVEL_RANK.insufficient_data;
  const candidateCrowd = LEVEL_RANK[candidate?.predictedCrowdLevel] || LEVEL_RANK.insufficient_data;

  if (!Number.isFinite(currentWait) || !Number.isFinite(candidateWait)) {
    return false;
  }

  const waitImprovement = currentWait - candidateWait;
  const crowdImprovement = currentCrowd - candidateCrowd;

  // Deterministic rule: only recommend when the alternative materially reduces wait or clearly lowers crowd.
  // Small differences are treated as non-actionable and should not trigger a recommendation.
  if (waitImprovement >= 5 && (candidateCrowd <= currentCrowd || candidateWait <= currentWait - 5)) {
    return true;
  }

  if (crowdImprovement >= 1 && candidateWait <= currentWait) {
    return true;
  }

  return false;
}

function normalizeCandidateDistance(candidate, currentPlace) {
  if (
    candidate.latitude == null || candidate.longitude == null ||
    currentPlace.latitude == null || currentPlace.longitude == null ||
    Number.isNaN(Number(candidate.latitude)) || Number.isNaN(Number(candidate.longitude)) ||
    Number.isNaN(Number(currentPlace.latitude)) || Number.isNaN(Number(currentPlace.longitude))
  ) {
    return null;
  }

  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(Number(candidate.latitude) - Number(currentPlace.latitude));
  const dLng = toRad(Number(candidate.longitude) - Number(currentPlace.longitude));
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(Number(currentPlace.latitude))) * Math.cos(toRad(Number(candidate.latitude))) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function scoreRecommendationCandidate(currentPlace, candidatePlace, currentIntelligence, candidateIntelligence, distanceKm) {
  const categoryBonus = String(candidatePlace.category || '').toLowerCase() === String(currentPlace.category || '').toLowerCase() ? 25 : 0;
  const sectorBonus = String(candidatePlace.sector || '').toLowerCase() === String(currentPlace.sector || '').toLowerCase() ? 20 : 0;
  const waitImprovement = Math.max(0, getWaitUpperBound(currentIntelligence?.predictedWaitRange) - getWaitUpperBound(candidateIntelligence?.predictedWaitRange));
  const crowdImprovement = Math.max(0, (LEVEL_RANK[currentIntelligence?.predictedCrowdLevel] || 99) - (LEVEL_RANK[candidateIntelligence?.predictedCrowdLevel] || 99));
  const confidenceBoost = CONFIDENCE_RANK[candidateIntelligence?.confidence] || 0;
  const reliabilityBoost = candidateIntelligence?.trend === 'stable' ? 5 : 0;
  const recencyBoost = candidateIntelligence?.reportsUsed ? Math.min(10, candidateIntelligence.reportsUsed) : 0;
  const distanceBoost = distanceKm != null ? Math.max(0, 15 - distanceKm) : 0;

  return categoryBonus + sectorBonus + waitImprovement + (crowdImprovement * 10) + confidenceBoost * 10 + reliabilityBoost + recencyBoost + distanceBoost;
}

function buildReason(currentIntelligence, candidateIntelligence, distanceKm) {
  const currentWait = getWaitUpperBound(currentIntelligence?.predictedWaitRange);
  const candidateWait = getWaitUpperBound(candidateIntelligence?.predictedWaitRange);
  const currentCrowd = currentIntelligence?.predictedCrowdLevel || 'insufficient_data';
  const candidateCrowd = candidateIntelligence?.predictedCrowdLevel || 'insufficient_data';

  const waitText = Number.isFinite(candidateWait) && Number.isFinite(currentWait) && candidateWait < currentWait
    ? 'lower expected wait'
    : 'lower expected wait';

  const crowdText = candidateCrowd !== currentCrowd && candidateCrowd === 'low'
    ? 'lower predicted crowd'
    : candidateCrowd !== currentCrowd
      ? 'lower predicted crowd'
      : 'similar predicted crowd';

  const distanceText = distanceKm != null ? ' and a nearby location' : '';

  if (candidateCrowd !== currentCrowd && Number.isFinite(candidateWait) && Number.isFinite(currentWait) && candidateWait < currentWait) {
    return `This option has ${waitText} and ${crowdText} based on recent reports${distanceText}.`;
  }

  if (Number.isFinite(candidateWait) && Number.isFinite(currentWait) && candidateWait < currentWait) {
    return 'This option has lower expected wait based on recent reports.';
  }

  if (candidateCrowd !== currentCrowd) {
    return 'This place has a lower predicted crowd with recent evidence.';
  }

  return 'This option is a better fit based on recent crowd evidence.';
}

function findSmartAlternative(currentPlace, candidatePlaces, context = {}) {
  if (!currentPlace || !Array.isArray(candidatePlaces) || candidatePlaces.length === 0) {
    return {
      available: false,
      recommendedPlace: null,
      reason: 'No sufficiently better alternative was found from the available crowd data.',
      confidence: 'low',
    };
  }

  const currentIntelligence = context.currentIntelligence || null;
  const currentWaitMin = context.currentWaitMin ?? null;
  const currentCrowdLevel = context.currentCrowdLevel || currentIntelligence?.predictedCrowdLevel || 'low';

  const candidates = candidatePlaces
    .filter((candidate) => candidate && candidate.id !== currentPlace.id)
    .map((candidate) => {
      const candidateIntelligence = context.candidateIntelligenceMap?.[candidate.id] || context.candidateIntelligence || null;
      const distanceKm = normalizeCandidateDistance(candidate, currentPlace);

      if (!candidateIntelligence || isLowEvidence(candidateIntelligence) || isStaleReport(candidateIntelligence)) {
        return null;
      }

      const baseline = currentIntelligence || {
        predictedWaitRange: { min: currentWaitMin ?? 0, max: currentWaitMin ?? 0, label: `${currentWaitMin ?? 0} min` },
        predictedCrowdLevel: currentCrowdLevel,
      };

      if (!isMeaningfullyBetter(baseline, candidateIntelligence)) {
        return null;
      }

      const score = scoreRecommendationCandidate(currentPlace, candidate, baseline, candidateIntelligence, distanceKm);

      return {
        candidate,
        intelligence: candidateIntelligence,
        distanceKm,
        score,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  if (candidates.length === 0) {
    return {
      available: false,
      recommendedPlace: null,
      reason: 'No sufficiently better alternative was found from the available crowd data.',
      confidence: 'low',
    };
  }

  const winner = candidates[0];
  const winnerDistance = winner.distanceKm;
  const winnerWithDistance = {
    ...winner.candidate,
    distanceKm: winnerDistance,
    currentWaitMin: Number.isFinite(Number(winner.intelligence?.predictedWaitRange?.max)) ? Number(winner.intelligence.predictedWaitRange.max) : null,
    crowdLevel: winner.intelligence?.predictedCrowdLevel || 'low',
    predictedCrowdLevel: winner.intelligence?.predictedCrowdLevel || 'low',
    predictedWaitRange: winner.intelligence?.predictedWaitRange || { min: null, max: null, label: 'insufficient_data' },
    confidence: winner.intelligence?.confidence || 'low',
    reason: buildReason(currentIntelligence, winner.intelligence, winnerDistance),
  };

  return {
    available: true,
    recommendedPlace: winnerWithDistance,
    reason: buildReason(currentIntelligence, winner.intelligence, winnerDistance),
    confidence: winner.intelligence?.confidence || 'low',
  };
}

function buildRecommendationResponse({ available, recommendedPlace, reason, confidence }) {
  if (!available || !recommendedPlace) {
    return {
      success: true,
      data: {
        available: false,
        recommendedPlace: null,
        reason: reason || 'No sufficiently better alternative was found from the available crowd data.',
        confidence: confidence || 'low',
      },
      available: false,
      recommendedPlace: null,
      reason: reason || 'No sufficiently better alternative was found from the available crowd data.',
      confidence: confidence || 'low',
    };
  }

  return {
    success: true,
    data: {
      available: true,
      recommendedPlace: {
        id: recommendedPlace.id,
        name: recommendedPlace.name,
        sector: recommendedPlace.sector || recommendedPlace.sector_name || 'general',
        category: recommendedPlace.category || 'General',
        distanceKm: recommendedPlace.distanceKm ?? null,
        currentWaitMin: recommendedPlace.currentWaitMin ?? null,
        crowdLevel: recommendedPlace.crowdLevel || recommendedPlace.predictedCrowdLevel || 'low',
        predictedCrowdLevel: recommendedPlace.predictedCrowdLevel || recommendedPlace.crowdLevel || 'low',
        predictedWaitRange: recommendedPlace.predictedWaitRange || { min: null, max: null, label: 'insufficient_data' },
        confidence: recommendedPlace.confidence || 'low',
      },
      reason: reason || 'This option has lower expected wait and lower predicted crowd based on recent reports.',
      confidence: recommendedPlace.confidence || confidence || 'low',
    },
    available: true,
    recommendedPlace: {
      id: recommendedPlace.id,
      name: recommendedPlace.name,
      sector: recommendedPlace.sector || recommendedPlace.sector_name || 'general',
      category: recommendedPlace.category || 'General',
      distanceKm: recommendedPlace.distanceKm ?? null,
      currentWaitMin: recommendedPlace.currentWaitMin ?? null,
      crowdLevel: recommendedPlace.crowdLevel || recommendedPlace.predictedCrowdLevel || 'low',
      predictedCrowdLevel: recommendedPlace.predictedCrowdLevel || recommendedPlace.crowdLevel || 'low',
      predictedWaitRange: recommendedPlace.predictedWaitRange || { min: null, max: null, label: 'insufficient_data' },
      confidence: recommendedPlace.confidence || 'low',
    },
    reason: reason || 'This option has lower expected wait and lower predicted crowd based on recent reports.',
    confidence: recommendedPlace.confidence || confidence || 'low',
  };
}

async function computeRecommendationForPlace(currentPlaceId, allPlaces, currentPlaceData, userLocation = null) {
  if (!currentPlaceId || !Array.isArray(allPlaces) || allPlaces.length === 0) {
    return buildRecommendationResponse({ available: false, reason: 'No sufficiently better alternative was found from the available crowd data.', confidence: 'low' });
  }

  const currentPlace = allPlaces.find((place) => place.id === currentPlaceId) || null;
  if (!currentPlace) {
    return buildRecommendationResponse({ available: false, reason: 'No sufficiently better alternative was found from the available crowd data.', confidence: 'low' });
  }

  const currentIntelligence = currentPlaceData?.intelligence || buildPlaceIntelligence(currentPlace, currentPlaceData?.reports || []);
  if (!currentIntelligence || currentIntelligence.predictedCrowdLevel === 'insufficient_data' || currentIntelligence.confidence === 'low') {
    return buildRecommendationResponse({ available: false, reason: 'Not enough reliable crowd data to recommend an alternative.', confidence: 'low' });
  }

  const candidatePlaces = allPlaces.filter((place) => place.id !== currentPlaceId);
  const candidateIntelligenceMap = {};

  candidatePlaces.forEach((place) => {
    const candidateReports = currentPlaceData?.candidateReports?.[place.id] || [];
    const intelligence = buildPlaceIntelligence(place, candidateReports);
    candidateIntelligenceMap[place.id] = intelligence;
  });

  const result = findSmartAlternative(currentPlace, candidatePlaces, {
    currentIntelligence,
    currentWaitMin: currentPlaceData?.currentWaitMin ?? null,
    currentCrowdLevel: currentPlaceData?.crowdLevel || currentIntelligence?.predictedCrowdLevel || 'low',
    candidateIntelligenceMap,
  });

  if (!result.available) {
    return buildRecommendationResponse({ available: false, reason: result.reason || 'No sufficiently better alternative was found from the available crowd data.', confidence: 'low' });
  }

  const withDistance = {
    ...result.recommendedPlace,
    distanceKm: userLocation && result.recommendedPlace ? normalizeCandidateDistance(result.recommendedPlace, currentPlace) : null,
  };

  return buildRecommendationResponse({
    available: true,
    recommendedPlace: withDistance,
    reason: result.reason,
    confidence: result.confidence,
  });
}

module.exports = {
  LEVEL_RANK,
  CONFIDENCE_RANK,
  getWaitUpperBound,
  getWaitLowerBound,
  isLowEvidence,
  isMeaningfullyBetter,
  normalizeCandidateDistance,
  scoreRecommendationCandidate,
  buildReason,
  findSmartAlternative,
  buildRecommendationResponse,
  computeRecommendationForPlace,
};
