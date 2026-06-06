import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const candidates = [
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(__dirname, "public"),
  ];
  const distPath = candidates.find((p) => fs.existsSync(p));
  if (!distPath) {
    throw new Error(
      `Could not find the build directory. Tried: ${candidates.join(", ")}. Run npm run build:client or set SERVE_CLIENT=false for API-only deploy.`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
