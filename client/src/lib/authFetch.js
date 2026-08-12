import { getAccessToken, getAccountType } from "./supabase";

/**
 * Attach the Supabase Bearer token to every same-origin /api/ request.
 *
 * The app has ~50 direct fetch() call sites across the singer and organization
 * dashboards that predate token auth. Patching fetch once here means none of
 * them can be missed — including any added later — and it keeps `apiFetch` and
 * raw `fetch` behaving identically. Requests that already set an Authorization
 * header (the admin bootstrap call) are left alone.
 */
export function installAuthFetch() {
  if (typeof window === "undefined" || window.__ssAuthFetchInstalled) return;
  window.__ssAuthFetchInstalled = true;

  const nativeFetch = window.fetch.bind(window);

  window.fetch = async function patchedFetch(input, init = {}) {
    let url;
    try {
      url = new URL(
        typeof input === "string" ? input : input?.url || "",
        window.location.origin,
      );
    } catch {
      return nativeFetch(input, init);
    }

    const isOwnApi =
      url.origin === window.location.origin && url.pathname.startsWith("/api/");
    if (!isOwnApi) return nativeFetch(input, init);

    const headers = new Headers(
      init.headers || (typeof input === "object" ? input?.headers : undefined),
    );
    if (!headers.has("Authorization")) {
      const token = await getAccessToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
    }
    if (!headers.has("X-Account-Type")) {
      const accountType = getAccountType();
      if (accountType) headers.set("X-Account-Type", accountType);
    }

    return nativeFetch(input, {
      credentials: "include",
      ...init,
      headers,
    });
  };
}
