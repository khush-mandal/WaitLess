const { query } = require('../config/database');
const env = require('../config/env');
const { validateCrowdReport } = require('../services/validators');

function writeJson(res, statusCode, payload) {
  if (res && typeof res.status === 'function') {
    return res.status(statusCode).json(payload);
  }

  if (res) {
    res.statusCode = statusCode;
    res.body = payload;
    if (typeof res.json === 'function') {
      return res.json(payload);
    }
  }

  return payload;
}

function handleControllerError(res, next, error) {
  const payload = {
    success: false,
    error: {
      code: error?.code || 'INTERNAL_SERVER_ERROR',
      message: error?.message || 'Internal Server Error',
    },
  };

  if (typeof next === 'function' && typeof res?.status !== 'function') {
    res.statusCode = error?.statusCode || 500;
    res.body = payload;
    return payload;
  }

  if (typeof next === 'function') {
    return next(error);
  }

  if (res) {
    res.statusCode = error?.statusCode || 500;
    res.body = payload;
    if (typeof res.json === 'function') {
      return res.json(payload);
    }
  }

  return payload;
}

function normalizeReportRow(row) {
  return {
    id: row.id,
    placeId: row.place_id,
    placeName: row.place_name,
    sector: row.sector,
    sectorName: row.sector_name,
    crowdLevel: row.crowd_level,
    pointsEarned: Number(row.points_earned),
    estimatedWaitMinutes: row.estimated_wait_minutes != null ? Number(row.estimated_wait_minutes) : null,
    notes: row.notes || null,
    createdAt: row.created_at,
  };
}

async function createReport(req, res, next) {
  try {
    if (!env.isDatabaseConfigured()) {
      const error = new Error('Database connection is not configured');
      error.statusCode = 503;
      error.code = 'DATABASE_UNAVAILABLE';
      throw error;
    }

    const body = req.body || {};
    const placeId = body.place_id ?? body.placeId;
    const crowdLevel = body.crowd_level ?? body.crowdLevel;
    const waitTimeMinutes = body.estimated_wait_minutes ?? body.waitTimeMinutes ?? null;
    const notes = body.notes ?? null;
    const userId = body.user_id ?? body.userId ?? null;
    const pointsEarned = body.pointsEarned ?? 10;

    if (!userId) {
      const error = new Error('Authenticated user is required to submit a report.');
      error.statusCode = 401;
      error.code = 'AUTH_REQUIRED';
      throw error;
    }

    const validationErrors = validateCrowdReport({
      placeId,
      crowdLevel,
      waitTimeMinutes,
      pointsEarned,
    });

    if (validationErrors.length > 0) {
      const error = new Error(validationErrors.join(', '));
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    const placeCheck = await query(
      'SELECT id, name, sector_id FROM places WHERE id = $1 AND is_active = TRUE LIMIT 1',
      [placeId]
    );

    if (placeCheck.rowCount === 0) {
      const error = new Error('Place not found');
      error.statusCode = 404;
      error.code = 'PLACE_NOT_FOUND';
      throw error;
    }

    const place = placeCheck.rows[0];
    const finalPoints = Number(pointsEarned) || 10;

    const reportResult = await query(
      `
        INSERT INTO crowd_reports (
          user_id,
          place_id,
          crowd_level,
          points_earned,
          estimated_wait_minutes,
          notes,
          is_demo
        )
        VALUES ($1, $2, $3, $4, $5, $6, FALSE)
        RETURNING id, user_id, place_id, crowd_level, points_earned, estimated_wait_minutes, notes, created_at
      `,
      [userId, place.id, crowdLevel, finalPoints, waitTimeMinutes !== null ? Number(waitTimeMinutes) : null, notes]
    );

    const report = reportResult.rows[0];

    const latestHistory = await query(
      `
        SELECT id, place_id, crowd_level, source, report_id, recorded_at
        FROM crowd_history
        WHERE place_id = $1
        ORDER BY recorded_at DESC
        LIMIT 1
      `,
      [place.id]
    );

    const placeSector = await query(
      'SELECT slug, name FROM sectors WHERE id = $1 LIMIT 1',
      [place.sector_id]
    );

    return writeJson(res, 201, {
      success: true,
      data: {
        report: {
          id: report.id,
          placeId: report.place_id,
          placeName: place.name,
          sector: placeSector.rows[0]?.slug || null,
          sectorName: placeSector.rows[0]?.name || null,
          crowdLevel: report.crowd_level,
          estimatedWaitMinutes: report.estimated_wait_minutes != null ? Number(report.estimated_wait_minutes) : null,
          notes: report.notes || null,
          pointsEarned: Number(report.points_earned),
          createdAt: report.created_at,
        },
        latestHistory: latestHistory.rows[0] || null,
      },
    });
  } catch (error) {
    return handleControllerError(res, next, error);
  }
}

async function listReports(req, res, next) {
  try {
    if (!env.isDatabaseConfigured()) {
      return writeJson(res, 200, {
        success: true,
        data: [],
      });
    }

    const { limit = 50, place_id, placeId, user_id, userId, minutes, hours } = req.query;
    const requestedPlaceId = place_id ?? placeId;
    const requestedUserId = user_id ?? userId ?? null;
    const limitValue = Math.min(Number(limit) || 50, 200);
    const windowMinutes = Number(minutes ?? hours ? hours * 60 : 1440);

    let sql = `
      SELECT
        cr.id,
        cr.user_id,
        cr.place_id,
        p.name AS place_name,
        s.slug AS sector,
        s.name AS sector_name,
        cr.crowd_level,
        cr.points_earned,
        cr.estimated_wait_minutes,
        cr.notes,
        cr.created_at
      FROM crowd_reports cr
      LEFT JOIN places p ON p.id = cr.place_id
      LEFT JOIN sectors s ON s.id = p.sector_id
      WHERE 1 = 1
    `;

    const params = [];
    let index = 1;

    if (requestedUserId) {
      sql += ` AND cr.user_id = $${index}`;
      params.push(requestedUserId);
      index += 1;
    }

    if (requestedPlaceId) {
      sql += ` AND cr.place_id = $${index}`;
      params.push(requestedPlaceId);
      index += 1;
    }

    if (Number.isFinite(windowMinutes) && windowMinutes > 0) {
      sql += ` AND cr.created_at >= NOW() - $${index}::interval`;
      params.push(`${windowMinutes} minutes`);
      index += 1;
    }

    sql += ` ORDER BY cr.created_at DESC LIMIT $${index}`;
    params.push(limitValue);

    const result = await query(sql, params);

    return writeJson(res, 200, {
      success: true,
      data: result.rows.map(normalizeReportRow),
    });
  } catch (error) {
    return handleControllerError(res, next, error);
  }
}

async function getReportsForPlace(req, res, next) {
  try {
    const { placeId } = req.params;
    req.query.place_id = placeId;
    return listReports(req, res, next);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createReport,
  listReports,
  getReportsForPlace,
};
