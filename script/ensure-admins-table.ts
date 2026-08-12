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
CREATE TABLE IF NOT EXISTS admins (
  id serial PRIMARY KEY,
  auth_user_id uuid,
  email text NOT NULL UNIQUE,
  name text,
  status text NOT NULL DEFAULT 'pending',
  is_super boolean NOT NULL DEFAULT false,
  invited_by integer,
  approved_by integer,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS admins_auth_user_id_idx ON admins (auth_user_id);
CREATE INDEX IF NOT EXISTS admins_status_idx ON admins (status);
CREATE INDEX IF NOT EXISTS admins_email_idx ON admins (email);
`);
const r = await pool.query(`SELECT to_regclass('public.admins') as t`);
console.log("admins =>", r.rows[0]);
await pool.end();
