type GeoResult = { lat: number; lng: number } | null;

const cache = new Map<string, GeoResult>();
let lastCallTime = 0;
const MIN_INTERVAL_MS = 1100;

async function rateLimit() {
  const now = Date.now();
  const wait = lastCallTime + MIN_INTERVAL_MS - now;
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCallTime = Date.now();
}

export function geocodeCacheKey(city: string, state: string) {
  return `${city.trim().toLowerCase()}|${state.trim().toLowerCase()}`;
}

export async function geocodeCityState(
  city?: string | null,
  state?: string | null
): Promise<GeoResult> {
  const c = (city || "").trim();
  const s = (state || "").trim();
  // Always require both city and state — never geocode city alone
  if (!c || !s) return null;
  const key = geocodeCacheKey(c, s);
  if (cache.has(key)) return cache.get(key)!;
  await rateLimit();
  try {
    const params = new URLSearchParams({
      city: c,
      state: s,
      countrycodes: "us",
      format: "json",
      limit: "1",
    });
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      { headers: { "User-Agent": "SingerSearch.net/1.0 (geocoding)" } }
    );
    if (!res.ok) {
      cache.set(key, null);
      return null;
    }
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!Array.isArray(data) || data.length === 0) {
      cache.set(key, null);
      return null;
    }
    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      cache.set(key, null);
      return null;
    }
    const result = { lat, lng };
    cache.set(key, result);
    return result;
  } catch {
    cache.set(key, null);
    return null;
  }
}
