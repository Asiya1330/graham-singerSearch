import { getAccessToken } from "./supabase";

/** fetch() for admin APIs — attaches Supabase Bearer token when present. */
export async function adminFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = await getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
}
