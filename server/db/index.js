const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'waitless.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at', dbPath);
  }
});

// Initialize database schema
db.serialize(() => {
  // 1. User Reports Table
  db.run(`
    CREATE TABLE IF NOT EXISTS user_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      place_id TEXT NOT NULL,
      place_name TEXT,
      user_id TEXT DEFAULT 'anonymous',
      crowd_level TEXT NOT NULL,
      wait_time_mins INTEGER NOT NULL,
      trust_score REAL DEFAULT 1.0,
      notes TEXT,
      timestamp INTEGER NOT NULL
    )
  `);

  // 2. Scraped Insights Table (AI Agent Web Search Data)
  db.run(`
    CREATE TABLE IF NOT EXISTS scraped_insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      place_id TEXT UNIQUE NOT NULL,
      place_name TEXT,
      source TEXT DEFAULT 'Web Review Scraper',
      sentiment_score REAL DEFAULT 3.0,
      mention_count INTEGER DEFAULT 0,
      summary_text TEXT,
      updated_at INTEGER NOT NULL
    )
  `);

  // 3. Seeded Patterns Table (Hackathon Demo Baseline)
  db.run(`
    CREATE TABLE IF NOT EXISTS seeded_patterns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      place_id TEXT NOT NULL,
      day_int INTEGER NOT NULL,
      hour_int INTEGER NOT NULL,
      busyness_percent INTEGER NOT NULL,
      UNIQUE(place_id, day_int, hour_int)
    )
  `);

  // 4. User Profiles & Gamification Table
  db.run(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id TEXT PRIMARY KEY,
      username TEXT,
      points INTEGER DEFAULT 0,
      reports_count INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 1,
      last_report_date TEXT,
      badges TEXT DEFAULT '[]'
    )
  `);
});

// Helper utilities wrapped in Promises for async/await
const dbQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

module.exports = {
  db,
  dbQuery,
  dbRun,
  dbGet
};
