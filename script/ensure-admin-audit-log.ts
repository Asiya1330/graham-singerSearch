import dotenv from "dotenv";
dotenv.config();
import pg from "pg";
import fs from "fs";
import path from "path";

const url = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("No DATABASE_URL");
  process.exit(1);
}

const sqlPath = path.resolve("migrations/004_admin_audit_log.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

const pool = new pg.Pool({ connectionString: url });
await pool.query(sql);
const r = await pool.query(`SELECT to_regclass('public.admin_audit_log') as t`);
console.log("admin_audit_log =>", r.rows[0]);
await pool.end();
