import { randomBytes } from "crypto";
import path from "path";
import type { Express } from "express";
import { getStorageBucket } from "./env";
import { getSupabaseAdmin } from "./supabase";

// Default signed-URL lifetime. Comfortable window so <img>/resume links don't
// break on long-open pages.
const DEFAULT_SIGNED_URL_TTL_SECONDS = 24 * 60 * 60;

const STORAGE_FILE_FIELDS = ["headshot_url", "resume_url"] as const;

function isHttpUrl(value: unknown): value is string {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

function isSignableStoragePath(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && !isHttpUrl(value);
}

/**
 * Uploads a file to Supabase Storage and returns the object PATH (not a public
 * URL). The bucket is private, so callers must mint signed URLs on read via
 * `signStoragePath` / `signSingerFiles`.
 */
export async function uploadToSupabaseStorage(
  folder: "headshots" | "resumes",
  file: Express.Multer.File,
): Promise<string> {
  const ext = path.extname(file.originalname) || "";
  const objectPath = `${folder}/${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
  const bucket = getStorageBucket();
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.storage.from(bucket).upload(objectPath, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  return objectPath;
}

/**
 * Returns a temporary signed URL for a stored object path.
 * - empty/null -> null
 * - already an http(s) URL (seeded Unsplash images, legacy public URLs) -> as-is
 * - otherwise -> a freshly signed URL for the private bucket object
 */
export async function signStoragePath(
  value: string | null | undefined,
  expiresIn: number = DEFAULT_SIGNED_URL_TTL_SECONDS,
): Promise<string | null> {
  if (!value) return null;
  if (isHttpUrl(value)) return value;

  const bucket = getStorageBucket();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(value, expiresIn);
  if (error || !data?.signedUrl) {
    console.error("[storage] failed to sign path", value, error?.message);
    return null;
  }
  return data.signedUrl;
}

/**
 * Signs the storage file fields (headshot_url, resume_url) on a single singer
 * record. Returns a shallow copy with the fields replaced by signed URLs.
 */
export async function signSingerFiles<T extends Record<string, any>>(
  singer: T | null | undefined,
  expiresIn: number = DEFAULT_SIGNED_URL_TTL_SECONDS,
): Promise<T | null | undefined> {
  if (!singer) return singer;
  const out: Record<string, any> = { ...singer };
  for (const field of STORAGE_FILE_FIELDS) {
    if (field in out) {
      out[field] = await signStoragePath(out[field], expiresIn);
    }
  }
  return out as T;
}

/**
 * Batch variant for lists. Collects every signable object path across the rows,
 * signs them in a single Supabase call, then maps results back onto each row.
 */
export async function signSingerFilesBatch<T extends Record<string, any>>(
  rows: T[],
  expiresIn: number = DEFAULT_SIGNED_URL_TTL_SECONDS,
): Promise<T[]> {
  if (!Array.isArray(rows) || rows.length === 0) return rows;

  const paths = new Set<string>();
  for (const row of rows) {
    for (const field of STORAGE_FILE_FIELDS) {
      const value = row?.[field];
      if (isSignableStoragePath(value)) paths.add(value);
    }
  }
  if (paths.size === 0) return rows;

  const pathList = Array.from(paths);
  const bucket = getStorageBucket();
  const supabase = getSupabaseAdmin();
  const signedMap = new Map<string, string | null>();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrls(pathList, expiresIn);
  if (error) {
    console.error("[storage] failed to batch-sign paths", error.message);
  }
  if (data) {
    for (const item of data) {
      if (item.path) signedMap.set(item.path, item.signedUrl ?? null);
    }
  }

  return rows.map((row) => {
    const out: Record<string, any> = { ...row };
    for (const field of STORAGE_FILE_FIELDS) {
      const value = out[field];
      if (isSignableStoragePath(value)) {
        out[field] = signedMap.has(value) ? signedMap.get(value) : null;
      }
    }
    return out as T;
  });
}
