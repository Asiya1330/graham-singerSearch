-- Idempotent addition of media link columns to singers table.
-- Safe to run multiple times against Supabase / production.

ALTER TABLE singers ADD COLUMN IF NOT EXISTS video_link_1 TEXT;
ALTER TABLE singers ADD COLUMN IF NOT EXISTS video_link_2 TEXT;
ALTER TABLE singers ADD COLUMN IF NOT EXISTS audio_link_1 TEXT;
