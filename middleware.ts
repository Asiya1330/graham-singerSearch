import { API_ERRORS } from "./shared/api-errors";

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
  // Let fetch recompute the length for the (possibly re-encoded) body. A stale
  // content-length corrupts multipart/binary uploads (resume/headshot).
  "content-length",
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

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function serviceUnavailable(status = 503): Response {
  return jsonResponse(
    {
      code: "SERVICE_UNAVAILABLE",
      message: API_ERRORS.SERVICE_UNAVAILABLE.message,
    },
    status,
  );
}

export const config = {
  matcher: ["/api/:path*"],
};

export default async function middleware(request: Request): Promise<Response> {
  const railwayBase = getRailwayBase();
  if (!railwayBase) {
    return serviceUnavailable(500);
  }

  const incoming = new URL(request.url);
  const target = `${railwayBase}${incoming.pathname}${incoming.search}`;

  try {
    const method = request.method.toUpperCase();
    const hasBody = method !== "GET" && method !== "HEAD";
    // Forward the raw bytes so multipart/binary uploads are not corrupted by a
    // text round-trip (await request.text() mangles non-UTF8 file bytes).
    const requestBody = hasBody ? await request.arrayBuffer() : undefined;

    const upstream = await fetch(target, {
      method,
      headers: forwardRequestHeaders(request),
      body: requestBody,
    });

    const responseBody = await upstream.text();
    const responseHeaders = new Headers();
    responseHeaders.set(
      "content-type",
      upstream.headers.get("content-type") || "application/json; charset=utf-8",
    );

    const setCookies =
      typeof upstream.headers.getSetCookie === "function"
        ? upstream.headers.getSetCookie()
        : [];
    if (setCookies.length > 0) {
      for (const cookie of setCookies) {
        responseHeaders.append("set-cookie", cookie);
      }
    } else {
      const cookie = upstream.headers.get("set-cookie");
      if (cookie) responseHeaders.append("set-cookie", cookie);
    }

    return new Response(responseBody, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("[api-proxy] upstream request failed:", err);
    return serviceUnavailable(503);
  }
}
