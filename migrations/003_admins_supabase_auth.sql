-- Migration: admins_supabase_auth
-- Date: 2026-08-05
-- Description: Invite-only admin roster for Supabase Auth (email/password + MFA).
--              status: pending | active | rejected | revoked
--              Seed supers are activated via POST /api/admin/auth/bootstrap.

CREATE TABLE IF NOT EXISTS admins (
  id serial PRIMARY KEY,
  auth_user_id uuid,
  email text NOT NULL,
  name text,
  status text NOT NULL DEFAULT 'pending',
  is_super boolean NOT NULL DEFAULT false,
  invited_by integer,
  approved_by integer,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS admins_email_unique
  ON admins (email);

CREATE UNIQUE INDEX IF NOT EXISTS admins_auth_user_id_idx
  ON admins (auth_user_id);

CREATE INDEX IF NOT EXISTS admins_status_idx
  ON admins (status);

CREATE INDEX IF NOT EXISTS admins_email_idx
  ON admins (email);
