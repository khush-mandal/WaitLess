const fs = require('fs');
const path = require('path');
const { assertDatabaseConfig } = require('../src/config/env');
const { getPool, query, closePool } = require('../src/config/database');

const MIGRATIONS_DIR = path.join(__dirname, '../src/db/migrations');

async function ensureMigrationsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations() {
  const result = await query('SELECT filename FROM schema_migrations ORDER BY filename');
  return new Set(result.rows.map((row) => row.filename));
}

async function runMigrations() {
  assertDatabaseConfig();
  await ensureMigrationsTable();

  const applied = await getAppliedMigrations();
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const pool = getPool();
  const client = await pool.connect();

  try {
    for (const filename of files) {
      if (applied.has(filename)) {
        console.log(`Skipping already applied migration: ${filename}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, filename), 'utf8');
      console.log(`Applying migration: ${filename}`);

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
        await client.query('COMMIT');
        console.log(`Applied migration: ${filename}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    client.release();
  }
}

runMigrations()
  .then(async () => {
    console.log('Migrations complete.');
    await closePool();
  })
  .catch(async (error) => {
    console.error('Migration failed:', error.message);
    await closePool();
    process.exit(1);
  });
