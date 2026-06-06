import { Pool, PoolClient } from "pg";
import fs from "fs";
import path from "path";

function parseCsv(content: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    if (cols.length < headers.length) continue;
    const overflow = cols.length - headers.length;
    if (overflow > 0) {
      const merged = cols.slice(1, 1 + overflow + 1).join(",");
      cols.splice(1, overflow + 1, merged);
    }
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (cols[idx] ?? "").trim();
    });
    rows.push(row);
  }
  return rows;
}

export async function seedRepertoire(client: PoolClient | Pool): Promise<number> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS repertoire_reference (
      id text PRIMARY KEY,
      work_title text NOT NULL,
      composer text,
      part_name text NOT NULL,
      voice_type_primary text,
      specialization text,
      part_tier text,
      category text,
      created_at timestamp DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS repertoire_work_title_idx ON repertoire_reference (work_title);
    CREATE INDEX IF NOT EXISTS repertoire_part_name_idx ON repertoire_reference (part_name);
    CREATE INDEX IF NOT EXISTS repertoire_category_idx ON repertoire_reference (category);
  `);

  const { rows: countRows } = await client.query("SELECT count(*)::int AS cnt FROM repertoire_reference");
  if (countRows[0].cnt > 0) return 0;

  // Avoid import.meta/__dirname runtime differences between ESM dev and CJS production bundle.
  // Railway runs `dist/index.cjs`, where the copied CSV is at `dist/data/repertoire.csv`.
  const candidatePaths = [
    path.resolve(process.cwd(), "dist", "data", "repertoire.csv"),
    path.resolve(process.cwd(), "server", "data", "repertoire.csv"),
  ];
  const csvPath = candidatePaths.find((p) => fs.existsSync(p));
  if (!csvPath) {
    console.warn(
      `[repertoire-seed] CSV not found. Tried: ${candidatePaths.join(", ")} — skipping`,
    );
    return 0;
  }
  const content = fs.readFileSync(csvPath, "utf-8");
  const records = parseCsv(content);

  let inserted = 0;
  const batchSize = 200;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const values: string[] = [];
    const params: any[] = [];
    let p = 1;
    for (const r of batch) {
      values.push(`($${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++})`);
      params.push(
        r.id,
        r.work_title,
        r.composer || null,
        r.part_name,
        r.voice_type_primary || null,
        r.specialization || null,
        r.part_tier || null,
        r.category || null,
        r.created_at ? new Date(r.created_at) : new Date(),
      );
    }
    if (values.length === 0) continue;
    await client.query(
      `INSERT INTO repertoire_reference (id, work_title, composer, part_name, voice_type_primary, specialization, part_tier, category, created_at)
       VALUES ${values.join(",")}
       ON CONFLICT (id) DO NOTHING`,
      params
    );
    inserted += batch.length;
  }
  return inserted;
}
