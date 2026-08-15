const test = require('node:test');
const assert = require('node:assert/strict');

const {
  calculateTrend,
  determineCrowdLevel,
  determineWaitRange,
  determineConfidence,
  buildBestTimeRecommendation,
  buildPlaceIntelligence,
} = require('../src/services/intelligenceService');
const { getPlaceIntelligence } = require('../src/controllers/placesController');

const now = Date.now();

function report(level, minutesAgo, waitMinutes = null) {
  return {
    crowd_level: level,
    created_at: new Date(now - minutesAgo * 60 * 1000).toISOString(),
    estimated_wait_minutes: waitMinutes,
  };
}

test('Place with no reports returns insufficient data', () => {
  const result = buildPlaceIntelligence({ id: 'place-1', name: 'Test Place' }, []);

  assert.equal(result.predictedCrowdLevel, 'insufficient_data');
  assert.equal(result.confidence, 'low');
  assert.equal(result.reportsUsed, 0);
  assert.match(result.explanation, /Not enough crowd reports/);
});

test('One recent report uses the report level', () => {
  const result = buildPlaceIntelligence({ id: 'place-1', name: 'Test Place' }, [report('low', 20, 5)]);

  assert.equal(result.predictedCrowdLevel, 'low');
  assert.equal(result.trend, 'insufficient_data');
  assert.equal(result.confidence, 'low');
});

test('Multiple consistent reports produce a stable pattern', () => {
  const result = buildPlaceIntelligence({ id: 'place-1', name: 'Test Place' }, [
    report('low', 120, 5),
    report('low', 70, 4),
    report('low', 20, 3),
  ]);

  assert.equal(result.predictedCrowdLevel, 'low');
  assert.equal(result.trend, 'stable');
  assert.ok(['medium', 'high'].includes(result.confidence) || result.confidence === 'high');
});

test('Multiple conflicting reports remain explainable and medium confidence', () => {
  const result = buildPlaceIntelligence({ id: 'place-1', name: 'Test Place' }, [
    report('low', 180, 5),
    report('medium', 100, 15),
    report('high', 20, 30),
  ]);

  assert.ok(['low', 'medium', 'high'].includes(result.predictedCrowdLevel));
  assert.equal(result.confidence, 'medium');
  assert.ok(result.explanation.length > 0);
});

test('Increasing trend is detected from recent reports', () => {
  const trend = calculateTrend([
    report('low', 90),
    report('medium', 45),
    report('high', 15),
  ]);

  assert.equal(trend, 'increasing');
});

test('Stable trend is detected from similar recent reports', () => {
  const trend = calculateTrend([
    report('medium', 90),
    report('medium', 40),
    report('medium', 15),
  ]);

  assert.equal(trend, 'stable');
});

test('Decreasing trend is detected from recent reports', () => {
  const trend = calculateTrend([
    report('high', 90),
    report('medium', 40),
    report('low', 15),
  ]);

  assert.equal(trend, 'decreasing');
});

test('Recent wait estimates get converted into a wait range', () => {
  const range = determineWaitRange([5, 12, 18, 20]);

  assert.deepEqual(range, { min: 5, max: 20, label: '5–20 min' });
});

test('Missing wait estimates return insufficient data', () => {
  const range = determineWaitRange([null, null, null]);

  assert.equal(range.label, 'insufficient_data');
});

test('Confidence rises with consistent recent evidence', () => {
  const confidence = determineConfidence([
    report('low', 90, 5),
    report('low', 45, 5),
    report('low', 15, 3),
  ]);

  assert.equal(confidence, 'high');
});

test('Best-time recommendation is unavailable with insufficient historical observations', () => {
  const result = buildBestTimeRecommendation([
    report('low', 120),
    report('low', 60),
  ]);

  assert.equal(result.available, false);
  assert.ok(result.reason.includes('Not enough historical observations'));
});

test('Invalid place ID returns PLACE_NOT_FOUND for intelligence endpoint', async () => {
  const req = { params: { id: '00000000-0000-0000-0000-000000000000' } };
  const res = {
    statusCode: 200,
    json(payload) {
      this.body = payload;
      return payload;
    },
  };

  await getPlaceIntelligence(req, res, () => {});

  assert.equal(res.body.success, false);
  assert.equal(res.body.error.code, 'PLACE_NOT_FOUND');
});
