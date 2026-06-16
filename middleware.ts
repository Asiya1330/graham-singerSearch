import { API_ERRORS } from "./shared/api-errors";

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
  let base = raw.replace(/\/$/, "");
  if (!/^https?:\/\//i.test(base)) {
    base = `https://${base}`;
  }
  return base;
}

function forwardRequestHeaders(request: Request): Headers {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return;
    headers.set(key, value);
  });
  return headers;
}

export const config = {
  matcher: ["/api/:path*"],
};

export default async function middleware(request: Request): Promise<Response> {
  const railwayBase = getRailwayBase();
  if (!railwayBase) {
    const body = {
      code: "SERVICE_UNAVAILABLE",
      message: API_ERRORS.SERVICE_UNAVAILABLE.message,
    };
    return new Response(JSON.stringify(body), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const incoming = new URL(request.url);
  const target = `${railwayBase}${incoming.pathname}${incoming.search}`;

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers: forwardRequestHeaders(request),
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : request.body,
    });

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: upstream.headers,
    });
  } catch (err) {
    console.error("[api-proxy] upstream request failed:", err);
    const body = {
      code: "SERVICE_UNAVAILABLE",
      message: API_ERRORS.SERVICE_UNAVAILABLE.message,
    };
    return new Response(JSON.stringify(body), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}
