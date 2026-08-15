const { Pool } = require('pg');
const env = require('./env');

let pool;

function getPool() {
  if (!pool) {
    env.assertDatabaseConfig();

    pool = new Pool({
      connectionString: env.databaseUrl,
      ssl: env.databaseSsl ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected PostgreSQL pool error:', err.message);
    });
  }

  return pool;
}

async function query(text, params) {
  env.assertDatabaseConfig();
  return getPool().query(text, params);
}

async function testConnection() {
  const result = await query('SELECT NOW() AS server_time');
  return result.rows[0];
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  getPool,
  query,
  testConnection,
  closePool,
};
