const test = require('node:test');
const assert = require('node:assert/strict');

const {
  findSmartAlternative,
  scoreRecommendationCandidate,
  buildRecommendationResponse,
} = require('../src/services/smartRecommendationService');
const { getPlaceRecommendation } = require('../src/controllers/placesController');

function report(level, minutesAgo, waitMinutes = null) {
  return {
    crowd_level: level,
    created_at: new Date(Date.now() - minutesAgo * 60 * 1000).toISOString(),
    estimated_wait_minutes: waitMinutes,
  };
}

function intelligence(overrides = {}) {
  return {
    placeId: 'candidate-1',
    predictedCrowdLevel: 'medium',
    predictedWaitRange: { min: 10, max: 20, label: '10–20 min' },
    trend: 'stable',
    confidence: 'medium',
    reportsUsed: 4,
    bestTime: { available: true, label: '14:00–16:00', reason: 'Based on recent reports from this place.' },
    explanation: 'Recent reports are stable.',
    ...overrides,
  };
}

function place(overrides = {}) {
  return {
    id: 'current-place',
    name: 'Current Place',
    sector: 'hospitality',
    category: 'Coffee Shop',
    latitude: null,
    longitude: null,
    ...overrides,
  };
}

test('Current place has no alternative', () => {
  const current = place({ id: 'current-place', category: 'Coffee Shop', sector: 'hospitality' });
  const result = findSmartAlternative(current, [], { currentWaitMin: 15, currentCrowdLevel: 'medium' });

  assert.equal(result.available, false);
  assert.equal(result.reason, 'No sufficiently better alternative was found from the available crowd data.');
});

test('Better same-category alternative', () => {
  const current = place({ id: 'current-place', category: 'Coffee Shop', sector: 'hospitality' });
  const candidate = place({ id: 'candidate-1', category: 'Coffee Shop', sector: 'hospitality', latitude: 1, longitude: 1 });
  const result = findSmartAlternative(current, [candidate], {
    currentWaitMin: 20,
    currentCrowdLevel: 'high',
    currentIntelligence: intelligence({ predictedCrowdLevel: 'high', predictedWaitRange: { min: 15, max: 30, label: '15–30 min' }, confidence: 'medium' }),
    candidateIntelligence: intelligence({ predictedCrowdLevel: 'low', predictedWaitRange: { min: 5, max: 10, label: '5–10 min' }, confidence: 'high' }),
  });

  assert.equal(result.available, true);
  assert.equal(result.recommendedPlace.id, 'candidate-1');
});

test('Same-sector alternative', () => {
  const current = place({ id: 'current-place', category: 'Bakery', sector: 'hospitality' });
  const candidate = place({ id: 'candidate-1', category: 'Coffee Shop', sector: 'hospitality' });
  const result = findSmartAlternative(current, [candidate], {
    currentWaitMin: 25,
    currentCrowdLevel: 'medium',
    currentIntelligence: intelligence({ predictedCrowdLevel: 'medium', predictedWaitRange: { min: 10, max: 25, label: '10–25 min' }, confidence: 'medium' }),
    candidateIntelligence: intelligence({ predictedCrowdLevel: 'low', predictedWaitRange: { min: 5, max: 10, label: '5–10 min' }, confidence: 'medium' }),
  });

  assert.equal(result.available, true);
  assert.equal(result.recommendedPlace.id, 'candidate-1');
});

test('Candidate with lower wait', () => {
  const current = place({ id: 'current-place', category: 'Coffee Shop', sector: 'hospitality' });
  const candidate = place({ id: 'candidate-1', category: 'Bookstore', sector: 'retail' });
  const result = findSmartAlternative(current, [candidate], {
    currentWaitMin: 20,
    currentCrowdLevel: 'medium',
    currentIntelligence: intelligence({ predictedCrowdLevel: 'medium', predictedWaitRange: { min: 10, max: 20, label: '10–20 min' }, confidence: 'medium' }),
    candidateIntelligence: intelligence({ predictedCrowdLevel: 'medium', predictedWaitRange: { min: 5, max: 10, label: '5–10 min' }, confidence: 'medium' }),
  });

  assert.equal(result.available, true);
  assert.ok(result.reason.includes('lower expected wait'));
});

test('Candidate with lower predicted crowd', () => {
  const current = place({ id: 'current-place', category: 'Coffee Shop', sector: 'hospitality' });
  const candidate = place({ id: 'candidate-1', category: 'Coffee Shop', sector: 'hospitality' });
  const result = findSmartAlternative(current, [candidate], {
    currentWaitMin: 15,
    currentCrowdLevel: 'high',
    currentIntelligence: intelligence({ predictedCrowdLevel: 'high', predictedWaitRange: { min: 10, max: 15, label: '10–15 min' }, confidence: 'medium' }),
    candidateIntelligence: intelligence({ predictedCrowdLevel: 'medium', predictedWaitRange: { min: 10, max: 15, label: '10–15 min' }, confidence: 'medium' }),
  });

  assert.equal(result.available, true);
  assert.ok(result.reason.includes('lower predicted crowd'));
});

test('Candidate with insufficient data', () => {
  const current = place({ id: 'current-place', category: 'Coffee Shop', sector: 'hospitality' });
  const candidate = place({ id: 'candidate-1', category: 'Coffee Shop', sector: 'hospitality' });
  const result = findSmartAlternative(current, [candidate], {
    currentWaitMin: 20,
    currentCrowdLevel: 'medium',
    currentIntelligence: intelligence({ predictedCrowdLevel: 'medium', predictedWaitRange: { min: 10, max: 20, label: '10–20 min' }, confidence: 'medium' }),
    candidateIntelligence: { ...intelligence(), predictedCrowdLevel: 'insufficient_data', confidence: 'low', reportsUsed: 0 },
  });

  assert.equal(result.available, false);
});

test('Candidate with low confidence', () => {
  const current = place({ id: 'current-place', category: 'Coffee Shop', sector: 'hospitality' });
  const candidate = place({ id: 'candidate-1', category: 'Coffee Shop', sector: 'hospitality' });
  const result = findSmartAlternative(current, [candidate], {
    currentWaitMin: 20,
    currentCrowdLevel: 'medium',
    currentIntelligence: intelligence({ predictedCrowdLevel: 'medium', predictedWaitRange: { min: 10, max: 20, label: '10–20 min' }, confidence: 'medium' }),
    candidateIntelligence: intelligence({ predictedCrowdLevel: 'low', predictedWaitRange: { min: 5, max: 10, label: '5–10 min' }, confidence: 'low', reportsUsed: 1 }),
  });

  assert.equal(result.available, false);
});

test('Candidate with stale reports', () => {
  const current = place({ id: 'current-place', category: 'Coffee Shop', sector: 'hospitality' });
  const candidate = place({ id: 'candidate-1', category: 'Coffee Shop', sector: 'hospitality' });
  const stale = intelligence({
    predictedCrowdLevel: 'low',
    predictedWaitRange: { min: 5, max: 10, label: '5–10 min' },
    confidence: 'medium',
    reportsUsed: 2,
  });
  stale.bestTime = { available: false, label: null, reason: 'Not enough historical observations yet.' };

  const result = findSmartAlternative(current, [candidate], {
    currentWaitMin: 30,
    currentCrowdLevel: 'high',
    currentIntelligence: intelligence({ predictedCrowdLevel: 'high', predictedWaitRange: { min: 15, max: 30, label: '15–30 min' }, confidence: 'medium' }),
    candidateIntelligence: stale,
  });

  assert.equal(result.available, false);
});

test('Candidate that is not meaningfully better', () => {
  const current = place({ id: 'current-place', category: 'Coffee Shop', sector: 'hospitality' });
  const candidate = place({ id: 'candidate-1', category: 'Coffee Shop', sector: 'hospitality' });
  const result = findSmartAlternative(current, [candidate], {
    currentWaitMin: 15,
    currentCrowdLevel: 'medium',
    currentIntelligence: intelligence({ predictedCrowdLevel: 'medium', predictedWaitRange: { min: 10, max: 15, label: '10–15 min' }, confidence: 'medium' }),
    candidateIntelligence: intelligence({ predictedCrowdLevel: 'medium', predictedWaitRange: { min: 10, max: 15, label: '10–15 min' }, confidence: 'medium' }),
  });

  assert.equal(result.available, false);
});

test('No coordinates available', () => {
  const current = place({ id: 'current-place', category: 'Coffee Shop', sector: 'hospitality', latitude: null, longitude: null });
  const candidate = place({ id: 'candidate-1', category: 'Coffee Shop', sector: 'hospitality', latitude: null, longitude: null });
  const result = findSmartAlternative(current, [candidate], {
    currentWaitMin: 25,
    currentCrowdLevel: 'high',
    currentIntelligence: intelligence({ predictedCrowdLevel: 'high', predictedWaitRange: { min: 15, max: 25, label: '15–25 min' }, confidence: 'medium' }),
    candidateIntelligence: intelligence({ predictedCrowdLevel: 'low', predictedWaitRange: { min: 5, max: 10, label: '5–10 min' }, confidence: 'high' }),
  });

  assert.equal(result.recommendedPlace.distanceKm, null);
});

test('Real coordinates available', () => {
  const current = place({ id: 'current-place', category: 'Coffee Shop', sector: 'hospitality', latitude: 40.0, longitude: -73.0 });
  const candidate = place({ id: 'candidate-1', category: 'Coffee Shop', sector: 'hospitality', latitude: 40.01, longitude: -73.0 });
  const result = findSmartAlternative(current, [candidate], {
    currentWaitMin: 25,
    currentCrowdLevel: 'high',
    currentIntelligence: intelligence({ predictedCrowdLevel: 'high', predictedWaitRange: { min: 15, max: 25, label: '15–25 min' }, confidence: 'medium' }),
    candidateIntelligence: intelligence({ predictedCrowdLevel: 'low', predictedWaitRange: { min: 5, max: 10, label: '5–10 min' }, confidence: 'high' }),
  });

  assert.ok(result.recommendedPlace.distanceKm !== null);
});

test('Invalid place ID returns PLACE_NOT_FOUND for recommendation endpoint', async () => {
  const req = { params: { id: '00000000-0000-0000-0000-000000000000' } };
  const res = {
    statusCode: 200,
    json(payload) {
      this.body = payload;
      return payload;
    },
  };

  await getPlaceRecommendation(req, res, () => {});

  assert.equal(res.body.success, false);
  assert.equal(res.body.error.code, 'PLACE_NOT_FOUND');
});

test('Recommendation response builder returns no recommendation fallback', () => {
  const response = buildRecommendationResponse({ available: false, reason: 'No sufficiently better alternative was found from the available crowd data.', confidence: 'low' });

  assert.equal(response.available, false);
  assert.equal(response.recommendedPlace, null);
  assert.equal(response.confidence, 'low');
});
