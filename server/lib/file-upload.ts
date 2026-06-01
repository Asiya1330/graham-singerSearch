import { randomBytes } from "crypto";
import path from "path";
import type { Express } from "express";
import { getStorageBucket } from "./env";
import { getSupabaseAdmin } from "./supabase";

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

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  return data.publicUrl;
}
