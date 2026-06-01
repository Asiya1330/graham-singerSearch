import { pool, db } from "./storage.js";
import { singers } from "../shared/schema.js";
import { and, isNotNull } from "drizzle-orm";
import { geocodeCityState } from "./lib/geocode.js";

const THRESHOLD_DEG = 0.5;

type Row = {
  id: number;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
};

type ReportRow = {
  id: number;
  name: string;
  city: string;
  state: string;
  storedLat: number | null;
  storedLng: number | null;
  geocodedLat: number | null;
  geocodedLng: number | null;
  dLat: number | null;
  dLng: number | null;
  status: "match" | "mismatch" | "geocode_failed" | "missing_stored";
};

function fmt(n: number | null, digits = 4): string {
  return n === null || n === undefined ? "—" : n.toFixed(digits);
}

function pad(s: string, n: number): string {
  return s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length);
}

async function main() {
  const rows = (await db
    .select({
      id: singers.id,
      first_name: singers.first_name,
      last_name: singers.last_name,
      city: singers.city,
      state: singers.state,
      latitude: singers.latitude,
      longitude: singers.longitude,
    })
    .from(singers)
    .where(and(isNotNull(singers.city), isNotNull(singers.state)))) as Row[];

  console.log(
    `[audit-geocode] Auditing ${rows.length} singers with city + state (threshold ${THRESHOLD_DEG}°)\n`
  );

  const report: ReportRow[] = [];

  for (const row of rows) {
    const city = (row.city || "").trim();
    const state = (row.state || "").trim();
    const name = `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() || `#${row.id}`;
    const geo = await geocodeCityState(city, state);

    let status: ReportRow["status"];
    let dLat: number | null = null;
    let dLng: number | null = null;

    if (!geo) {
      status = "geocode_failed";
    } else if (row.latitude === null || row.longitude === null) {
      status = "missing_stored";
    } else {
      dLat = Math.abs(geo.lat - row.latitude);
      dLng = Math.abs(geo.lng - row.longitude);
      status = dLat > THRESHOLD_DEG || dLng > THRESHOLD_DEG ? "mismatch" : "match";
    }

    const entry: ReportRow = {
      id: row.id,
      name,
      city,
      state,
      storedLat: row.latitude,
      storedLng: row.longitude,
      geocodedLat: geo?.lat ?? null,
      geocodedLng: geo?.lng ?? null,
      dLat,
      dLng,
      status,
    };
    report.push(entry);

    const marker =
      status === "match"
        ? "OK    "
        : status === "mismatch"
        ? "MISMTCH"
        : status === "geocode_failed"
        ? "GEOFAIL"
        : "NOSTORE";
    console.log(
      `[${marker}] #${row.id} ${pad(name, 28)} ${pad(`${city}, ${state}`, 30)} ` +
        `stored=(${fmt(row.latitude)}, ${fmt(row.longitude)}) ` +
        `geo=(${fmt(geo?.lat ?? null)}, ${fmt(geo?.lng ?? null)}) ` +
        `Δ=(${fmt(dLat)}, ${fmt(dLng)})`
    );
  }

  const counts = {
    match: report.filter((r) => r.status === "match").length,
    mismatch: report.filter((r) => r.status === "mismatch").length,
    geocode_failed: report.filter((r) => r.status === "geocode_failed").length,
    missing_stored: report.filter((r) => r.status === "missing_stored").length,
  };

  console.log("\n========== SUMMARY ==========");
  console.log(`Total audited:    ${report.length}`);
  console.log(`Matches:          ${counts.match}`);
  console.log(`Mismatches (>${THRESHOLD_DEG}°): ${counts.mismatch}`);
  console.log(`Geocode failures: ${counts.geocode_failed}`);
  console.log(`Missing stored:   ${counts.missing_stored}`);

  const mismatches = report.filter((r) => r.status === "mismatch");
  if (mismatches.length > 0) {
    console.log("\n========== MISMATCHES ==========");
    console.log(JSON.stringify(mismatches, null, 2));
  }

  await pool.end();
}

main().catch((err) => {
  console.error("[audit-geocode] Fatal:", err);
  process.exit(1);
});
