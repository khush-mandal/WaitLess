require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || (isProduction ? '' : 'http://localhost:5173,http://127.0.0.1:5173'),
  databaseUrl: process.env.DATABASE_URL || '',
  databaseSsl: process.env.DATABASE_SSL !== 'false',
};

function isDatabaseConfigured() {
  return Boolean(env.databaseUrl && env.databaseUrl.trim());
}

function assertDatabaseConfig() {
  if (!isDatabaseConfigured()) {
    const error = new Error(
      'DATABASE_URL is not set. Copy server/.env.example to server/.env and add your Supabase connection string.'
    );
    error.statusCode = 500;
    throw error;
  }
}

module.exports = { ...env, assertDatabaseConfig, isDatabaseConfigured };
