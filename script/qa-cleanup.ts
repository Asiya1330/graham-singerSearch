/**
 * Remove QA test accounts left behind by the API suite.
 *
 * Every fixture email is minted by tests/helpers/accounts.ts as
 * `qa-<tag>-<ts>-<rand>@example.com`, so that prefix is the only thing this
 * deletes — in both Postgres and Supabase Auth. Safe to run repeatedly.
 *
 *   npx tsx script/qa-cleanup.ts          # report only
 *   npx tsx script/qa-cleanup.ts --apply  # actually delete
 */
import "dotenv/config";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

/**
 * Matches ONLY the fixture format minted by tests/helpers/accounts.ts:
 * qa-<tag>-<13-digit epoch ms>-<6 char random>@example.com
 *
 * Deliberately narrower than `qa-%@example.com`: the database also holds
 * older `qa-singer-<rand>@example.com` rows from a previous testing effort,
 * and those are not this suite's to delete.
 */
const PREFIX = "^qa-.+-[0-9]{13}-[a-z0-9]{6}@example\\.com$";
const apply = process.argv.includes("--apply");

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is required`);
  return v;
}

async function main() {
  const pool = new pg.Pool({
    connectionString: env("SUPABASE_DATABASE_URL"),
    ssl: { rejectUnauthorized: false },
  });
  const supabase = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const singers = await pool.query(
    "select id, email, auth_user_id from singers where email ~ $1",
    [PREFIX],
  );
  const orgs = await pool.query(
    "select id, email, auth_user_id from organizations where email ~ $1",
    [PREFIX],
  );

  console.log(`singers: ${singers.rowCount}, organizations: ${orgs.rowCount}`);
  if (!apply) {
    console.log("dry run — pass --apply to delete");
    await pool.end();
    return;
  }

  const singerIds = singers.rows.map((r) => r.id);
  if (singerIds.length) {
    // Children first: these carry FKs back to singers.
    for (const table of ["singer_roles", "singer_works", "availabilities", "contact_reveals"]) {
      await pool
        .query(`delete from ${table} where singer_id = any($1::int[])`, [singerIds])
        .catch((e) => console.warn(`  skip ${table}: ${e.message}`));
    }
  }
  const orgIds = orgs.rows.map((r) => r.id);
  if (orgIds.length) {
    await pool
      .query("delete from contact_reveals where org_id = any($1::int[])", [orgIds])
      .catch((e) => console.warn(`  skip contact_reveals(org): ${e.message}`));
  }

  const s = await pool.query("delete from singers where email ~ $1", [PREFIX]);
  const o = await pool.query("delete from organizations where email ~ $1", [PREFIX]);
  console.log(`deleted rows — singers: ${s.rowCount}, organizations: ${o.rowCount}`);

  // Sweep Auth by email rather than by the auth_user_id just read from the
  // rows: tests delete their own auth users in afterAll, so those ids are
  // mostly stale, and a crashed run leaves users with no row pointing at them.
  const pattern = new RegExp(PREFIX);
  const leftover: string[] = [];
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      console.warn(`  listUsers failed: ${error.message}`);
      break;
    }
    if (!data.users.length) break;
    for (const u of data.users) {
      if (u.email && pattern.test(u.email)) leftover.push(u.id);
    }
  }

  let removed = 0;
  for (const id of leftover) {
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) console.warn(`  deleteUser ${id}: ${error.message}`);
    else removed++;
  }
  console.log(`deleted auth users: ${removed}/${leftover.length}`);

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
