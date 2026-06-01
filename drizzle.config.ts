import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config();

const url =
  process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "SUPABASE_DATABASE_URL is required (Supabase → Database → Transaction pooler connection string)",
  );
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url,
  },
});
