-- Migration: admin_audit_log + roles prep
-- Date: 2026-08-08
-- Description: Audit trail for privileged admin roster actions.
--              Auth app_metadata now uses roles: string[] (see server/lib/auth-roles.ts).

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id serial PRIMARY KEY,
  action text NOT NULL,
  actor_admin_id integer,
  actor_email text,
  target_admin_id integer,
  target_email text,
  metadata jsonb,
  created_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_audit_log_action_idx
  ON admin_audit_log (action);

CREATE INDEX IF NOT EXISTS admin_audit_log_actor_idx
  ON admin_audit_log (actor_admin_id);

CREATE INDEX IF NOT EXISTS admin_audit_log_created_at_idx
  ON admin_audit_log (created_at);
