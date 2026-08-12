-- Migration: singer_org_supabase_auth
-- Date: 2026-08-08
-- Description: Link singers/organizations to Supabase Auth users.
--              `password` becomes nullable: accounts created after the cutover
--              have no local scrypt hash. Legacy hashes stay until the owner
--              logs in once, at which point the account is linked and the hash
--              is cleared (see server/lib/auth-migrate.ts).

ALTER TABLE singers
  ADD COLUMN IF NOT EXISTS auth_user_id uuid;

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS auth_user_id uuid;

ALTER TABLE singers
  ALTER COLUMN password DROP NOT NULL;

ALTER TABLE organizations
  ALTER COLUMN password DROP NOT NULL;

-- Unique but nullable: Postgres allows many NULLs, so unlinked rows coexist.
CREATE UNIQUE INDEX IF NOT EXISTS singers_auth_user_id_idx
  ON singers (auth_user_id);

CREATE UNIQUE INDEX IF NOT EXISTS organizations_auth_user_id_idx
  ON organizations (auth_user_id);
