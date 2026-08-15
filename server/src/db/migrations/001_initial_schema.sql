-- WaitLess initial schema (Phase 2)
-- Safe to re-run: uses IF NOT EXISTS where possible

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- sectors
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon_name VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT sectors_slug_unique UNIQUE (slug),
  CONSTRAINT sectors_slug_format CHECK (slug ~ '^[a-z_]+$'),
  CONSTRAINT sectors_name_not_empty CHECK (length(trim(name)) > 0)
);

DROP TRIGGER IF EXISTS trg_sectors_updated_at ON sectors;
CREATE TRIGGER trg_sectors_updated_at
  BEFORE UPDATE ON sectors
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  level_label VARCHAR(100),
  total_points INTEGER NOT NULL DEFAULT 0,
  weekly_points INTEGER NOT NULL DEFAULT 0,
  reports_this_week INTEGER NOT NULL DEFAULT 0,
  total_reports INTEGER NOT NULL DEFAULT 0,
  time_saved_minutes INTEGER NOT NULL DEFAULT 0,
  people_helped INTEGER NOT NULL DEFAULT 0,
  impact_score INTEGER NOT NULL DEFAULT 0,
  community_rank_label VARCHAR(50),
  saved_hours_number NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_email_unique UNIQUE (email),
  CONSTRAINT users_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT users_total_points_nonneg CHECK (total_points >= 0),
  CONSTRAINT users_weekly_points_nonneg CHECK (weekly_points >= 0),
  CONSTRAINT users_reports_this_week_nonneg CHECK (reports_this_week >= 0),
  CONSTRAINT users_total_reports_nonneg CHECK (total_reports >= 0),
  CONSTRAINT users_time_saved_minutes_nonneg CHECK (time_saved_minutes >= 0),
  CONSTRAINT users_people_helped_nonneg CHECK (people_helped >= 0),
  CONSTRAINT users_impact_score_range CHECK (impact_score >= 0 AND impact_score <= 100),
  CONSTRAINT users_saved_hours_number_nonneg CHECK (saved_hours_number >= 0)
);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();

CREATE INDEX IF NOT EXISTS idx_users_is_demo ON users (is_demo);

-- ---------------------------------------------------------------------------
-- places (static venue catalog — live crowd comes from reports/history)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id VARCHAR(50),
  sector_id UUID NOT NULL REFERENCES sectors (id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  image_url TEXT,
  map_x_percent NUMERIC(5, 2),
  map_y_percent NUMERIC(5, 2),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT places_legacy_id_unique UNIQUE (legacy_id),
  CONSTRAINT places_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT places_category_not_empty CHECK (length(trim(category)) > 0),
  CONSTRAINT places_coords_check CHECK (
    (latitude IS NULL AND longitude IS NULL)
    OR (
      latitude BETWEEN -90 AND 90
      AND longitude BETWEEN -180 AND 180
    )
  ),
  CONSTRAINT places_map_coords_check CHECK (
    (map_x_percent IS NULL AND map_y_percent IS NULL)
    OR (
      map_x_percent BETWEEN 0 AND 100
      AND map_y_percent BETWEEN 0 AND 100
    )
  )
);

DROP TRIGGER IF EXISTS trg_places_updated_at ON places;
CREATE TRIGGER trg_places_updated_at
  BEFORE UPDATE ON places
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();

CREATE INDEX IF NOT EXISTS idx_places_sector_id ON places (sector_id);
CREATE INDEX IF NOT EXISTS idx_places_is_active ON places (is_active);
CREATE INDEX IF NOT EXISTS idx_places_is_demo ON places (is_demo);
CREATE INDEX IF NOT EXISTS idx_places_name ON places (name);

-- ---------------------------------------------------------------------------
-- crowd_reports (user-submitted observations)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crowd_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users (id) ON DELETE SET NULL,
  place_id UUID NOT NULL REFERENCES places (id) ON DELETE CASCADE,
  crowd_level VARCHAR(10) NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 10,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT crowd_reports_level_check CHECK (crowd_level IN ('low', 'medium', 'high')),
  CONSTRAINT crowd_reports_points_earned_nonneg CHECK (points_earned >= 0)
);

DROP TRIGGER IF EXISTS trg_crowd_reports_updated_at ON crowd_reports;
CREATE TRIGGER trg_crowd_reports_updated_at
  BEFORE UPDATE ON crowd_reports
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();

CREATE INDEX IF NOT EXISTS idx_crowd_reports_place_id ON crowd_reports (place_id);
CREATE INDEX IF NOT EXISTS idx_crowd_reports_user_id ON crowd_reports (user_id);
CREATE INDEX IF NOT EXISTS idx_crowd_reports_created_at ON crowd_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crowd_reports_place_created ON crowd_reports (place_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- crowd_history (append-only log derived from real reports / aggregation)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crowd_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES places (id) ON DELETE CASCADE,
  crowd_level VARCHAR(10) NOT NULL,
  source VARCHAR(50) NOT NULL DEFAULT 'report',
  report_id UUID REFERENCES crowd_reports (id) ON DELETE SET NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT crowd_history_level_check CHECK (crowd_level IN ('low', 'medium', 'high', 'unknown')),
  CONSTRAINT crowd_history_source_check CHECK (source IN ('report', 'aggregation'))
);

CREATE INDEX IF NOT EXISTS idx_crowd_history_place_id ON crowd_history (place_id);
CREATE INDEX IF NOT EXISTS idx_crowd_history_recorded_at ON crowd_history (recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_crowd_history_place_recorded ON crowd_history (place_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_crowd_history_report_id ON crowd_history (report_id);

-- Auto-record history when a report is submitted (real data only)
CREATE OR REPLACE FUNCTION record_crowd_history_from_report()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO crowd_history (place_id, crowd_level, source, report_id, recorded_at)
  VALUES (NEW.place_id, NEW.crowd_level, 'report', NEW.id, NEW.created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_crowd_report_history ON crowd_reports;
CREATE TRIGGER trg_crowd_report_history
  AFTER INSERT ON crowd_reports
  FOR EACH ROW
  EXECUTE PROCEDURE record_crowd_history_from_report();

-- ---------------------------------------------------------------------------
-- saved_places (user favorites — UI favorite button is not wired yet)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS saved_places (
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES places (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, place_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_places_user_id ON saved_places (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_places_place_id ON saved_places (place_id);

-- ---------------------------------------------------------------------------
-- notifications: intentionally omitted — frontend notifications are hardcoded
-- in App.jsx and not loaded from any data source today.
-- ---------------------------------------------------------------------------
