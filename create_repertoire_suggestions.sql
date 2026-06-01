-- Idempotent creation of repertoire_suggestions table for Supabase / production.
-- Safe to run multiple times.

CREATE TABLE IF NOT EXISTS repertoire_suggestions (
  id            SERIAL PRIMARY KEY,
  singer_id     INTEGER NOT NULL REFERENCES singers(id) ON DELETE CASCADE,
  work_title    TEXT NOT NULL,
  composer      TEXT,
  role_name     TEXT,
  notes         TEXT,
  status        TEXT NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS repertoire_suggestions_singer_idx
  ON repertoire_suggestions (singer_id);

CREATE INDEX IF NOT EXISTS repertoire_suggestions_status_idx
  ON repertoire_suggestions (status);
