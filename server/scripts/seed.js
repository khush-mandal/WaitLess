const fs = require('fs');
const path = require('path');
const { assertDatabaseConfig } = require('../src/config/env');
const { getPool, query, closePool } = require('../src/config/database');

const SEED_FILE = path.join(__dirname, '../src/db/seed/demo_seed.sql');

async function runSeed() {
  assertDatabaseConfig();

  const sql = fs.readFileSync(SEED_FILE, 'utf8');
  console.log('Running demo seed (static catalog only, no fake crowd stats)...');

  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');

    const counts = await query(`
      SELECT
        (SELECT COUNT(*) FROM sectors) AS sectors,
        (SELECT COUNT(*) FROM places WHERE is_demo = TRUE) AS demo_places,
        (SELECT COUNT(*) FROM users WHERE is_demo = TRUE) AS demo_users,
        (SELECT COUNT(*) FROM crowd_reports) AS crowd_reports,
        (SELECT COUNT(*) FROM crowd_history) AS crowd_history
    `);

    console.log('Demo seed complete:', counts.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

runSeed()
  .then(async () => {
    await closePool();
  })
  .catch(async (error) => {
    console.error('Seed failed:', error.message);
    await closePool();
    process.exit(1);
  });
