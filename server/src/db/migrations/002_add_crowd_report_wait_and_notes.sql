-- Add persisted wait-time and notes fields to crowd_reports.

ALTER TABLE crowd_reports
  ADD COLUMN IF NOT EXISTS estimated_wait_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS notes TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'crowd_reports_wait_time_range'
  ) THEN
    ALTER TABLE crowd_reports
      ADD CONSTRAINT crowd_reports_wait_time_range
      CHECK (
        estimated_wait_minutes IS NULL
        OR (
          estimated_wait_minutes >= 0
          AND estimated_wait_minutes <= 600
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'crowd_reports_notes_length'
  ) THEN
    ALTER TABLE crowd_reports
      ADD CONSTRAINT crowd_reports_notes_length
      CHECK (
        notes IS NULL
        OR char_length(trim(notes)) <= 1000
      );
  END IF;
END $$;
