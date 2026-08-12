/**
 * Idempotent runner for migrations/005_singer_org_supabase_auth.sql.
 * Matches the pattern of script/ensure-admins-table.ts.
 *
 *   npx tsx script/ensure-singer-org-auth-columns.ts
 */
import dotenv from "dotenv";
dotenv.config();
import pg from "pg";

const url = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("No DATABASE_URL");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: url });

await pool.query(`
ALTER TABLE singers ADD COLUMN IF NOT EXISTS auth_user_id uuid;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS auth_user_id uuid;
ALTER TABLE singers ALTER COLUMN password DROP NOT NULL;
ALTER TABLE organizations ALTER COLUMN password DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS singers_auth_user_id_idx ON singers (auth_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS organizations_auth_user_id_idx ON organizations (auth_user_id);
`);

const { rows } = await pool.query(`
  SELECT
    (SELECT count(*) FROM singers)                              AS singers,
    (SELECT count(*) FROM singers WHERE auth_user_id IS NOT NULL) AS singers_linked,
    (SELECT count(*) FROM organizations)                        AS orgs,
    (SELECT count(*) FROM organizations WHERE auth_user_id IS NOT NULL) AS orgs_linked
`);

console.log("columns ready. link progress:", rows[0]);
console.log(
  "Unlinked accounts migrate automatically on their next login (or password reset).",
);

await pool.end();
