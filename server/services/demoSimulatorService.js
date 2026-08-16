const { dbRun, dbQuery } = require('../db');

/**
 * Demo Data & Simulation Engine (Source 3)
 * Provides seeded hackathon crowd trends and live background simulator.
 */

// Seed default patterns for popular venue categories
async function seedDefaultHackathonData() {
  try {
    const venues = [
      { id: 'google_demo_1', name: 'Central Food Court & Mall' },
      { id: 'osm_1001', name: 'City Metro Station Terminal' },
      { id: 'osm_1002', name: 'Apex General Hospital' },
      { id: 'osm_1003', name: 'Starbucks Coffee & Co.' }
    ];

    for (const venue of venues) {
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          // Wednesday (day 3) lowest traffic; Friday/Saturday peak
          const dayFactor = day === 3 ? 0.35 : (day === 5 || day === 6) ? 0.85 : 0.55;
          const hourFactor = (hour >= 11 && hour <= 14) || (hour >= 17 && hour <= 20) ? 0.9 : 0.3;
          const busyness = Math.min(98, Math.max(10, Math.floor(100 * dayFactor * hourFactor)));

          await dbRun(`
            INSERT INTO seeded_patterns (place_id, day_int, hour_int, busyness_percent)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(place_id, day_int, hour_int) DO UPDATE SET busyness_percent = excluded.busyness_percent
          `, [venue.id, day, hour, busyness]);
        }
      }
    }
    console.log('Seeded hackathon demo crowd patterns initialized successfully.');
  } catch (err) {
    console.error('Error seeding demo data:', err.message);
  }
}

/**
 * Auto-generates simulated live check-in reports every few minutes for hackathon testing
 */
async function simulateLiveCheckin(placeId, placeName) {
  try {
    const crowdLevels = ['Low', 'Moderate', 'High', 'Packed'];
    const selectedLevel = crowdLevels[Math.floor(Math.random() * crowdLevels.length)];
    const waitTime = selectedLevel === 'Low' ? 5 : selectedLevel === 'Moderate' ? 15 : selectedLevel === 'High' ? 25 : 45;
    const now = Date.now();

    await dbRun(`
      INSERT INTO user_reports (place_id, place_name, user_id, crowd_level, wait_time_mins, trust_score, notes, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      placeId || 'google_demo_1',
      placeName || 'Central Mall',
      'demo_bot_agent',
      selectedLevel,
      waitTime,
      1.2,
      'Automated hackathon live check-in report',
      now
    ]);

    return { success: true, placeId, selectedLevel, waitTime, timestamp: now };
  } catch (err) {
    console.error('Live Checkin Simulation Error:', err.message);
    return null;
  }
}

/**
 * Get seeded pattern for a specific place, day, and hour
 */
async function getSeededPattern(placeId, dayInt, hourInt) {
  try {
    const rows = await dbQuery(
      `SELECT busyness_percent FROM seeded_patterns WHERE place_id = ? AND day_int = ? AND hour_int = ?`,
      [placeId, dayInt, hourInt]
    );
    if (rows && rows.length > 0) return rows[0].busyness_percent;
    // Fallback deterministic busyness if not explicitly seeded
    return 45;
  } catch (err) {
    return 45;
  }
}

module.exports = {
  seedDefaultHackathonData,
  simulateLiveCheckin,
  getSeededPattern
};
