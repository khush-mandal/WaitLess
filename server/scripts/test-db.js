const { assertDatabaseConfig } = require('../src/config/env');
const { testConnection, query, closePool } = require('../src/config/database');
const { validateCrowdReport } = require('../src/services/validators');

async function testRead() {
  const result = await query(`
    SELECT s.slug, s.name, COUNT(p.id)::int AS place_count
    FROM sectors s
    LEFT JOIN places p ON p.sector_id = s.id AND p.is_active = TRUE
    GROUP BY s.id, s.slug, s.name
    ORDER BY s.slug
  `);

  return result.rows;
}

async function testWrite() {
  const placeResult = await query(
    `SELECT id, legacy_id, name FROM places WHERE legacy_id = $1 LIMIT 1`,
    ['place-1']
  );

  if (placeResult.rowCount === 0) {
    throw new Error('Demo place place-1 not found. Run npm run db:seed first.');
  }

  const place = placeResult.rows[0];
  const crowdLevel = 'low';
  const validationErrors = validateCrowdReport({
    placeId: place.id,
    crowdLevel,
    pointsEarned: 10,
  });

  if (validationErrors.length > 0) {
    throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
  }

  const client = await require('../src/config/database').getPool().connect();

  try {
    await client.query('BEGIN');

    const reportResult = await client.query(
      `
        INSERT INTO crowd_reports (place_id, crowd_level, points_earned, is_demo)
        VALUES ($1, $2, $3, TRUE)
        RETURNING id, place_id, crowd_level, created_at
      `,
      [place.id, crowdLevel, 10]
    );

    const historyResult = await client.query(
      `
        SELECT id, place_id, crowd_level, source, report_id, recorded_at
        FROM crowd_history
        WHERE report_id = $1
      `,
      [reportResult.rows[0].id]
    );

    await client.query('ROLLBACK');

    return {
      rolledBack: true,
      report: reportResult.rows[0],
      historyCreatedByTrigger: historyResult.rows[0],
      note: 'Write test used a transaction rollback — no persistent test data was saved.',
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function runTests() {
  assertDatabaseConfig();

  console.log('1) Testing database connection...');
  const connection = await testConnection();
  console.log('   Connected. Server time:', connection.server_time);

  console.log('2) Testing read operation (sectors + place counts)...');
  const sectors = await testRead();
  console.log('   Read OK:', sectors);

  console.log('3) Testing write operation (insert report + history trigger, then rollback)...');
  const writeResult = await testWrite();
  console.log('   Write OK:', writeResult);

  console.log('\nAll database tests passed.');
}

runTests()
  .then(async () => {
    await closePool();
  })
  .catch(async (error) => {
    console.error('\nDatabase test failed:', error.message);
    await closePool();
    process.exit(1);
  });
