const { query } = require('../config/database');
const env = require('../config/env');
const { calculateCurrentCrowdStatus } = require('../services/crowdStatusService');
const { buildPlaceIntelligence } = require('../services/intelligenceService');
const { findSmartAlternative, buildRecommendationResponse } = require('../services/smartRecommendationService');

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

function normalizePlaceRow(row) {
  const crowdLevel = row.latest_crowd_level || 'low';
  const crowdStatus = row.latest_crowd_level || 'low';
  const waitMinutes = Number(row.estimated_wait_minutes ?? 0);
  const confidence = Number(row.confidence ?? 0);

  return {
    id: row.id,
    name: row.name,
    sector: row.sector_slug || row.sector || 'general',
    sectorName: row.sector_name || row.sector || 'General',
    category: row.category,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    image: row.image_url,
    currentWaitMin: waitMinutes,
    crowdLevel: crowdLevel,
    statusLabel: crowdStatus === 'high' ? 'Very Busy' : crowdStatus === 'medium' ? 'Moderate' : 'Not Busy',
    confidence,
    reportsCount: Number(row.reports_count ?? 0),
    distance: row.distance_km != null ? `${Number(row.distance_km).toFixed(1)} km` : null,
    mapCoords: row.map_x_percent != null && row.map_y_percent != null ? {
      xPercent: Number(row.map_x_percent),
      yPercent: Number(row.map_y_percent),
    } : null,
    bestHours: row.best_hours || null,
    latestReport: row.latest_report_at || null,
  };
}

async function getPlaces(req, res, next) {
  try {
    if (!env.isDatabaseConfigured()) {
      return writeJson(res, 200, {
        success: true,
        data: [],
      });
    }

    const { sector, category, search, lat, lng, radiusKm } = req.query;

    let sql = `
      SELECT
        p.id,
        p.name,
        p.category,
        p.address,
        p.latitude,
        p.longitude,
        p.image_url,
        p.map_x_percent,
        p.map_y_percent,
        s.slug AS sector_slug,
        s.name AS sector_name,
        COALESCE((
          SELECT cr.crowd_level
          FROM crowd_reports cr
          WHERE cr.place_id = p.id
          ORDER BY cr.created_at DESC
          LIMIT 1
        ), 'low') AS latest_crowd_level,
        COALESCE((
          SELECT COUNT(*)
          FROM crowd_reports cr
          WHERE cr.place_id = p.id
        ), 0)::int AS reports_count,
        COALESCE((
          SELECT AVG(CASE
            WHEN cr.crowd_level = 'low' THEN 10
            WHEN cr.crowd_level = 'medium' THEN 25
            ELSE 45
          END)
          FROM crowd_reports cr
          WHERE cr.place_id = p.id
        ), 0) AS estimated_wait_minutes,
        COALESCE((
          SELECT COUNT(*)::int
          FROM crowd_reports cr
          WHERE cr.place_id = p.id
        ), 0) AS confidence
      FROM places p
      LEFT JOIN sectors s ON s.id = p.sector_id
      WHERE p.is_active = TRUE
    `;

    const params = [];
    let index = 1;

    if (sector) {
      sql += ` AND s.slug = $${index}`;
      params.push(String(sector));
      index += 1;
    }

    if (category) {
      sql += ` AND p.category ILIKE $${index}`;
      params.push(`%${String(category)}%`);
      index += 1;
    }

    if (search) {
      sql += ` AND (p.name ILIKE $${index} OR p.address ILIKE $${index} OR p.category ILIKE $${index})`;
      params.push(`%${String(search)}%`);
      index += 1;
    }

    if (lat && lng) {
      sql += ` AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL`;
    }

    sql += ` ORDER BY p.name ASC`;

    const result = await query(sql, params);
    let rows = result.rows.map(normalizePlaceRow);

    if (lat && lng) {
      const userLat = Number(lat);
      const userLng = Number(lng);
      const radius = radiusKm ? Number(radiusKm) : 50;

      rows = rows
        .filter((place) => place.latitude != null && place.longitude != null)
        .map((place) => {
          const distanceKm = calculateDistanceKm(userLat, userLng, Number(place.latitude), Number(place.longitude));
          return { ...place, distanceKm, distance: `${distanceKm.toFixed(1)} km` };
        })
        .filter((place) => distanceKmWithin(place.distanceKm, radius))
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }

    return writeJson(res, 200, {
      success: true,
      data: rows,
    });
  } catch (error) {
    return handleControllerError(res, next, error);
  }
}

async function getPlaceById(req, res, next) {
  try {
    if (!env.isDatabaseConfigured()) {
      const error = new Error('Database connection is not configured');
      error.statusCode = 503;
      error.code = 'DATABASE_UNAVAILABLE';
      throw error;
    }

    const { id } = req.params;

    const sql = `
      SELECT
        p.id,
        p.name,
        p.category,
        p.address,
        p.latitude,
        p.longitude,
        p.image_url,
        p.map_x_percent,
        p.map_y_percent,
        s.slug AS sector_slug,
        s.name AS sector_name,
        COALESCE((
          SELECT cr.crowd_level
          FROM crowd_reports cr
          WHERE cr.place_id = p.id
          ORDER BY cr.created_at DESC
          LIMIT 1
        ), 'low') AS latest_crowd_level,
        COALESCE((
          SELECT COUNT(*)
          FROM crowd_reports cr
          WHERE cr.place_id = p.id
        ), 0)::int AS reports_count,
        COALESCE((
          SELECT AVG(CASE
            WHEN cr.crowd_level = 'low' THEN 10
            WHEN cr.crowd_level = 'medium' THEN 25
            ELSE 45
          END)
          FROM crowd_reports cr
          WHERE cr.place_id = p.id
        ), 0) AS estimated_wait_minutes,
        COALESCE((
          SELECT MAX(cr.created_at)
          FROM crowd_reports cr
          WHERE cr.place_id = p.id
        ), NULL) AS latest_report_at
      FROM places p
      LEFT JOIN sectors s ON s.id = p.sector_id
      WHERE p.id = $1 AND p.is_active = TRUE
      LIMIT 1
    `;

    const result = await query(sql, [id]);

    if (result.rowCount === 0) {
      const error = new Error('Place not found');
      error.statusCode = 404;
      error.code = 'PLACE_NOT_FOUND';
      throw error;
    }

    const place = normalizePlaceRow(result.rows[0]);

    return writeJson(res, 200, {
      success: true,
      data: place,
    });
  } catch (error) {
    return handleControllerError(res, next, error);
  }
}

async function getPlaceCrowdStatus(req, res, next) {
  try {
    if (!env.isDatabaseConfigured()) {
      const error = new Error('Database connection is not configured');
      error.statusCode = 503;
      error.code = 'DATABASE_UNAVAILABLE';
      throw error;
    }

    const { id } = req.params;

    const placeResult = await query(
      'SELECT id, name FROM places WHERE id = $1 AND is_active = TRUE LIMIT 1',
      [id]
    );

    if (placeResult.rowCount === 0) {
      const error = new Error('Place not found');
      error.statusCode = 404;
      error.code = 'PLACE_NOT_FOUND';
      throw error;
    }

    const recentReports = await query(
      `
        SELECT id, place_id, crowd_level, created_at
        FROM crowd_reports
        WHERE place_id = $1
        ORDER BY created_at DESC
        LIMIT 50
      `,
      [id]
    );

    const currentStatus = calculateCurrentCrowdStatus(recentReports.rows, { windowMinutes: 1440 });

    return writeJson(res, 200, {
      success: true,
      data: {
        placeId: placeResult.rows[0].id,
        placeName: placeResult.rows[0].name,
        crowdLevel: currentStatus.crowdLevel,
        statusLabel: currentStatus.statusLabel,
        confidence: currentStatus.confidence,
        reportsUsed: currentStatus.reportsUsed,
        reportCount: currentStatus.reportCount,
        latestReportAt: currentStatus.latestReportAt,
        windowMinutes: currentStatus.windowMinutes,
        summary: currentStatus.summary,
        source: 'recent_user_reports',
      },
    });
  } catch (error) {
    return handleControllerError(res, next, error);
  }
}

async function getPlaceIntelligence(req, res, next) {
  try {
    if (!env.isDatabaseConfigured()) {
      const error = new Error('Database connection is not configured');
      error.statusCode = 503;
      error.code = 'DATABASE_UNAVAILABLE';
      throw error;
    }

    const { id } = req.params;

    const placeResult = await query(
      'SELECT id, name FROM places WHERE id = $1 AND is_active = TRUE LIMIT 1',
      [id]
    );

    if (placeResult.rowCount === 0) {
      const error = new Error('Place not found');
      error.statusCode = 404;
      error.code = 'PLACE_NOT_FOUND';
      throw error;
    }

    const recentReports = await query(
      `
        SELECT id, place_id, crowd_level, estimated_wait_minutes, created_at
        FROM crowd_reports
        WHERE place_id = $1
        ORDER BY created_at DESC
        LIMIT 50
      `,
      [id]
    );

    const intelligence = buildPlaceIntelligence(placeResult.rows[0], recentReports.rows);

    return writeJson(res, 200, {
      success: true,
      data: intelligence,
    });
  } catch (error) {
    return handleControllerError(res, next, error);
  }
}

async function getPlaceRecommendation(req, res, next) {
  try {
    if (!env.isDatabaseConfigured()) {
      const error = new Error('Database connection is not configured');
      error.statusCode = 503;
      error.code = 'DATABASE_UNAVAILABLE';
      throw error;
    }

    const { id } = req.params;

    const placeResult = await query(
      `
        SELECT
          p.id,
          p.name,
          p.category,
          p.latitude,
          p.longitude,
          s.slug AS sector,
          s.name AS sector_name
        FROM places p
        LEFT JOIN sectors s ON s.id = p.sector_id
        WHERE p.id = $1 AND p.is_active = TRUE
        LIMIT 1
      `,
      [id]
    );

    if (placeResult.rowCount === 0) {
      const error = new Error('Place not found');
      error.statusCode = 404;
      error.code = 'PLACE_NOT_FOUND';
      throw error;
    }

    const currentPlace = placeResult.rows[0];
    const allPlaces = await query(
      `
        SELECT
          p.id,
          p.name,
          p.category,
          p.latitude,
          p.longitude,
          s.slug AS sector,
          s.name AS sector_name
        FROM places p
        LEFT JOIN sectors s ON s.id = p.sector_id
        WHERE p.is_active = TRUE
        ORDER BY p.name ASC
      `
    );

    const currentReports = await query(
      `
        SELECT id, place_id, crowd_level, estimated_wait_minutes, created_at
        FROM crowd_reports
        WHERE place_id = $1
        ORDER BY created_at DESC
        LIMIT 50
      `,
      [id]
    );

    const currentIntelligence = buildPlaceIntelligence(currentPlace, currentReports.rows);
    const relatedPlaceIds = allPlaces.rows.filter((place) => place.id !== id).map((place) => place.id);
    const candidateReportsByPlace = {};

    if (relatedPlaceIds.length > 0) {
      const reportRows = await query(
        `
          SELECT place_id, id, crowd_level, estimated_wait_minutes, created_at
          FROM crowd_reports
          WHERE place_id = ANY ($1)
          ORDER BY place_id, created_at DESC
        `,
        [relatedPlaceIds]
      );

      for (const row of reportRows.rows) {
        if (!candidateReportsByPlace[row.place_id]) {
          candidateReportsByPlace[row.place_id] = [];
        }
        candidateReportsByPlace[row.place_id].push(row);
      }
    }

    const currentWaitMin = currentReports.rows.length > 0
      ? Math.max(...currentReports.rows.map((row) => Number(row.estimated_wait_minutes ?? 0)).filter(Number.isFinite))
      : null;

    const recommendation = findSmartAlternative(currentPlace, allPlaces.rows, {
      currentIntelligence,
      currentWaitMin,
      currentCrowdLevel: currentIntelligence.predictedCrowdLevel,
      candidateIntelligenceMap: Object.fromEntries(
        Object.entries(candidateReportsByPlace).map(([placeId, rows]) => [
          placeId,
          buildPlaceIntelligence(allPlaces.rows.find((place) => place.id === placeId), rows)
        ])
      ),
    });

    const response = buildRecommendationResponse({
      available: recommendation.available,
      recommendedPlace: recommendation.recommendedPlace,
      reason: recommendation.reason,
      confidence: recommendation.confidence,
    });

    return writeJson(res, 200, response);
  } catch (error) {
    return handleControllerError(res, next, error);
  }
}

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function distanceKmWithin(distanceKm, radiusKm) {
  return Number.isFinite(distanceKm) && distanceKm <= Number(radiusKm);
}

module.exports = {
  getPlaces,
  getPlaceById,
  getPlaceCrowdStatus,
  getPlaceIntelligence,
  getPlaceRecommendation,
};
