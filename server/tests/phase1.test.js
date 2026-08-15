const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const { validateCrowdReport } = require('../src/services/validators');
const { calculateCurrentCrowdStatus } = require('../src/services/crowdStatusService');
const { getPlaces, getPlaceCrowdStatus } = require('../src/controllers/placesController');
const { createReport, listReports } = require('../src/controllers/reportsController');
const { query, closePool, getPool } = require('../src/config/database');

const hasDatabaseEnv = fs.existsSync('.env') || Boolean(process.env.DATABASE_URL);
const AUTH_USER_ID = 'a0000001-0000-4000-8000-000000000001';

function createErrorAwareRes() {
  const res = {
    statusCode: 200,
    json(payload) {
      this.body = payload;
      return payload;
    },
  };

  const next = (error) => {
    res.statusCode = error?.statusCode || 500;
    res.body = {
      success: false,
      error: {
        code: error?.code || 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Internal Server Error',
      },
    };
  };

  return { res, next };
}

test('validateCrowdReport accepts a valid crowd submission', () => {
  const errors = validateCrowdReport({
    placeId: 'place-1',
    crowdLevel: 'medium',
    waitTimeMinutes: 12,
    pointsEarned: 10,
  });

  assert.deepEqual(errors, []);
});

test('validateCrowdReport rejects invalid crowd level', () => {
  const errors = validateCrowdReport({
    placeId: 'place-1',
    crowdLevel: 'extreme',
    waitTimeMinutes: 12,
    pointsEarned: 10,
  });

  assert.ok(errors.some((error) => error.includes('crowdLevel')));
});

test('validateCrowdReport rejects invalid wait time', () => {
  const errors = validateCrowdReport({
    placeId: 'place-1',
    crowdLevel: 'low',
    waitTimeMinutes: -5,
    pointsEarned: 10,
  });

  assert.ok(errors.some((error) => error.includes('waitTimeMinutes')));
});

test('getPlaces returns data payload with a success flag', { skip: !hasDatabaseEnv }, async () => {
  const req = { query: {} };
  const res = {
    statusCode: 200,
    json(payload) {
      this.body = payload;
      return payload;
    },
  };

  await getPlaces(req, res, () => {});

  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
});

test('createReport rejects invalid place', { skip: !hasDatabaseEnv }, async () => {
  const { res, next } = createErrorAwareRes();
  const req = {
    body: {
      user_id: AUTH_USER_ID,
      place_id: '00000000-0000-0000-0000-000000000000',
      crowd_level: 'low',
    },
  };

  await createReport(req, res, next);

  assert.equal(res.body.success, false);
  assert.equal(res.body.error.code, 'PLACE_NOT_FOUND');
});

test('createReport validates required report fields', { skip: !hasDatabaseEnv }, async () => {
  const { res, next } = createErrorAwareRes();
  const req = {
    body: {
      user_id: AUTH_USER_ID,
      place_id: '',
      crowd_level: 'invalid',
    },
  };

  await createReport(req, res, next);

  assert.equal(res.body.success, false);
  assert.equal(res.body.error.code, 'VALIDATION_ERROR');
});

test('createReport stores a valid report', { skip: !hasDatabaseEnv }, async () => {
  const placeResult = await query('SELECT id FROM places WHERE legacy_id = $1 LIMIT 1', ['place-1']);
  assert.ok(placeResult.rowCount > 0, 'seeded demo place must exist');

  const req = {
    body: {
      user_id: AUTH_USER_ID,
      place_id: placeResult.rows[0].id,
      crowd_level: 'medium',
      estimated_wait_minutes: 18,
      notes: 'Test report',
    },
  };
  const { res, next } = createErrorAwareRes();

  await createReport(req, res, next);

  assert.equal(res.body.success, true);
  assert.equal(res.body.data.report.crowdLevel, 'medium');
  assert.equal(res.body.data.report.estimatedWaitMinutes, 18);
  assert.equal(res.body.data.report.notes, 'Test report');

  const checkResult = await query(
    `SELECT estimated_wait_minutes, notes FROM crowd_reports WHERE place_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [placeResult.rows[0].id]
  );

  assert.equal(Number(checkResult.rows[0].estimated_wait_minutes), 18);
  assert.equal(checkResult.rows[0].notes, 'Test report');
});

test('listReports returns a success payload', { skip: !hasDatabaseEnv }, async () => {
  const req = { query: {} };
  const res = {
    statusCode: 200,
    json(payload) {
      this.body = payload;
      return payload;
    },
  };

  await listReports(req, res, () => {});

  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
});

test('listReports filters by place', { skip: !hasDatabaseEnv }, async () => {
  const placeResult = await query('SELECT id FROM places WHERE legacy_id = $1 LIMIT 1', ['place-2']);
  const req = { query: { place_id: placeResult.rows[0].id, limit: 10 } };
  const res = {
    statusCode: 200,
    json(payload) {
      this.body = payload;
      return payload;
    },
  };

  await listReports(req, res, () => {});
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
});

test('getPlaceCrowdStatus computes current status for a place', { skip: !hasDatabaseEnv }, async () => {
  const placeResult = await query('SELECT id, name FROM places WHERE legacy_id = $1 LIMIT 1', ['place-1']);
  const req = { params: { id: placeResult.rows[0].id } };
  const res = {
    statusCode: 200,
    json(payload) {
      this.body = payload;
      return payload;
    },
  };

  await getPlaceCrowdStatus(req, res, () => {});
  assert.equal(res.body.success, true);
  assert.ok(['low', 'medium', 'high'].includes(res.body.data.crowdLevel));
});

test('calculateCurrentCrowdStatus handles no reports', () => {
  const status = calculateCurrentCrowdStatus([]);
  assert.equal(status.crowdLevel, 'low');
  assert.equal(status.reportsUsed, 0);
  assert.equal(status.summary.includes('No recent crowd reports'), true);
});

test('calculateCurrentCrowdStatus balances conflicting recent reports', () => {
  const status = calculateCurrentCrowdStatus([
    { crowd_level: 'low', created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
    { crowd_level: 'high', created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { crowd_level: 'medium', created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
  ]);

  assert.ok(['low', 'medium', 'high'].includes(status.crowdLevel));
  assert.equal(status.reportsUsed, 3);
  assert.ok(status.confidence >= 0);
});

test.after(async () => {
  await closePool();
});
