import type { IncomingMessage, ServerResponse } from "node:http";
import { URL } from "node:url";

export const config = {
  api: {
    bodyParser: false,
  },
};

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
]);

function getRailwayBase(): string | null {
  const raw = process.env.RAILWAY_API_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

function getApiPath(req: IncomingMessage): string {
  const query = req.url?.split("?")[0] ?? "";
  const prefix = "/api/";
  if (query.startsWith(prefix)) {
    return query.slice(prefix.length);
  }
  return query.replace(/^\//, "");
}

function buildTargetUrl(req: IncomingMessage, railwayBase: string): string {
  const apiPath = getApiPath(req);
  const incoming = new URL(req.url ?? "/", "http://localhost");
  const target = new URL(`/api/${apiPath}`, railwayBase);
  target.search = incoming.search;
  return target.toString();
}

function forwardRequestHeaders(req: IncomingMessage): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (!value || HOP_BY_HOP.has(key.toLowerCase())) continue;
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else {
      headers.set(key, value);
    }
  }
  return headers;
}

function forwardResponseHeaders(
  upstream: Response,
  res: ServerResponse,
): void {
  upstream.headers.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return;
    res.setHeader(key, value);
  });
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const railwayBase = getRailwayBase();
  if (!railwayBase) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        message:
          "RAILWAY_API_URL is not set on Vercel. Add it under Project Settings → Environment Variables (Production and Preview).",
      }),
    );
    return;
  }

  const method = req.method ?? "GET";
  const targetUrl = buildTargetUrl(req, railwayBase);

  try {
    const init: RequestInit & { duplex?: "half" } = {
      method,
      headers: forwardRequestHeaders(req),
    };
    if (method !== "GET" && method !== "HEAD") {
      init.body = req as BodyInit;
      init.duplex = "half";
    }

    const upstream = await fetch(targetUrl, init);

    res.statusCode = upstream.status;
    forwardResponseHeaders(upstream, res);

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.end(buffer);
  } catch (err) {
    console.error("[api-proxy] Railway request failed:", err);
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        message: "Failed to reach Railway API",
        target: targetUrl.replace(/\/\/[^@]+@/, "//***@"),
      }),
    );
  }
}
