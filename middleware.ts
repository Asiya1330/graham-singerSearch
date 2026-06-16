import { API_ERRORS } from "./shared/api-errors";

/** Hop-by-hop / forbidden when constructing a new Response on Vercel Edge. */
const STRIP_REQUEST_HEADERS = new Set([
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

const STRIP_RESPONSE_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
  "content-encoding",
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
    if (STRIP_REQUEST_HEADERS.has(key.toLowerCase())) return;
    headers.set(key, value);
  });
  return headers;
}

function buildProxyResponse(upstream: Response, body: ArrayBuffer): Response {
  const headers = new Headers();

  upstream.headers.forEach((value, key) => {
    if (STRIP_RESPONSE_HEADERS.has(key.toLowerCase())) return;
    if (key.toLowerCase() === "set-cookie") return;
    headers.set(key, value);
  });

  // Session cookies must be forwarded for successful logins.
  const setCookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : [];
  if (setCookies.length > 0) {
    for (const cookie of setCookies) {
      headers.append("set-cookie", cookie);
    }
  } else {
    const single = upstream.headers.get("set-cookie");
    if (single) headers.set("set-cookie", single);
  }

  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json; charset=utf-8");
  }

  return new Response(body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}

function serviceUnavailableResponse(status = 503): Response {
  const body = {
    code: "SERVICE_UNAVAILABLE",
    message: API_ERRORS.SERVICE_UNAVAILABLE.message,
  };
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const config = {
  matcher: ["/api/:path*"],
};

export default async function middleware(request: Request): Promise<Response> {
  const railwayBase = getRailwayBase();
  if (!railwayBase) {
    return serviceUnavailableResponse(500);
  }

  const incoming = new URL(request.url);
  const target = `${railwayBase}${incoming.pathname}${incoming.search}`;

  try {
    const init: RequestInit & { duplex?: "half" } = {
      method: request.method,
      headers: forwardRequestHeaders(request),
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
      init.duplex = "half";
    }

    const upstream = await fetch(target, init);
    const body = await upstream.arrayBuffer();

    return buildProxyResponse(upstream, body);
  } catch (err) {
    console.error("[api-proxy] upstream request failed:", err);
    return serviceUnavailableResponse(503);
  }
}
