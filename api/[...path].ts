export const config = {
  runtime: "edge",
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

function forwardRequestHeaders(request: Request): Headers {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return;
    headers.set(key, value);
  });
  return headers;
}

function forwardResponseHeaders(upstream: Response): Headers {
  const headers = new Headers();
  upstream.headers.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return;
    headers.append(key, value);
  });
  return headers;
}

export default async function handler(request: Request): Promise<Response> {
  const railwayBase = getRailwayBase();
  if (!railwayBase) {
    return new Response(
      JSON.stringify({
        message:
          "RAILWAY_API_URL is not set on Vercel. Add it under Project Settings → Environment Variables (Production and Preview).",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
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
      headers: forwardResponseHeaders(upstream),
    });
  } catch (err) {
    console.error("[api-proxy] Railway request failed:", err);
    return new Response(
      JSON.stringify({
        message: "Failed to reach Railway API",
        target,
      }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
}
