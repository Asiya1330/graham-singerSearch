import { pool, db } from "./storage.js";
import { singers } from "../shared/schema.js";
import { eq, and, isNull, or, isNotNull } from "drizzle-orm";
import { geocodeCityState } from "./lib/geocode.js";

async function main() {
  const rows = await db
    .select({
      id: singers.id,
      city: singers.city,
      state: singers.state,
      latitude: singers.latitude,
      longitude: singers.longitude,
    })
    .from(singers)
    .where(
      and(
        isNotNull(singers.city),
        or(isNull(singers.latitude), isNull(singers.longitude))
      )
    );

  console.log(`[backfill-geocode] Found ${rows.length} singers needing geocoding`);
  let ok = 0;
  const failed: Array<{ id: number; city: string | null; state: string | null }> = [];

  for (const row of rows) {
    const result = await geocodeCityState(row.city, row.state);
    if (result) {
      await db
        .update(singers)
        .set({ latitude: result.lat, longitude: result.lng })
        .where(eq(singers.id, row.id));
      ok++;
      console.log(
        `[backfill-geocode] #${row.id} ${row.city}, ${row.state || ""} → ${result.lat}, ${result.lng}`
      );
    } else {
      failed.push({ id: row.id, city: row.city, state: row.state });
      console.warn(
        `[backfill-geocode] FAILED #${row.id} ${row.city}, ${row.state || ""}`
      );
    }
  }

  console.log(`[backfill-geocode] Done. Success: ${ok}, Failed: ${failed.length}`);
  if (failed.length > 0) {
    console.log("[backfill-geocode] Failed singers:", JSON.stringify(failed, null, 2));
  }
  await pool.end();
}

main().catch((err) => {
  console.error("[backfill-geocode] Fatal:", err);
  process.exit(1);
});
