import { createClient } from "@supabase/supabase-js";

let client = null;

export function getSupabaseBrowser() {
  if (client) return client;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required to sign in",
    );
  }

  // Auth traffic goes through this app's own origin (see
  // server/lib/supabase-proxy.ts) so the project URL does not appear in the
  // network tab. VITE_SUPABASE_DIRECT=1 bypasses the proxy when debugging.
  const base =
    import.meta.env.VITE_SUPABASE_DIRECT === "1"
      ? url
      : `${window.location.origin}/api/sb`;

  client = createClient(base, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}

export function isSupabaseConfigured() {
  return !!(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  );
}

/**
 * Current access token, refreshed automatically by the client when expired.
 * Returns null when signed out or unconfigured — callers fall through to an
 * unauthenticated request rather than failing.
 */
export async function getAccessToken() {
  try {
    if (!isSupabaseConfigured()) return null;
    const supabase = getSupabaseBrowser();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch {
    return null;
  }
}

/**
 * Which dashboard this browser last signed in to. A single Auth user can hold
 * both the singer and organization roles, so the server needs the hint to pick
 * the right profile; it is sent as X-Account-Type on every API call.
 */
const ACCOUNT_TYPE_KEY = "ss.accountType";

export function getAccountType() {
  try {
    const v = window.localStorage.getItem(ACCOUNT_TYPE_KEY);
    return v === "singer" || v === "organization" ? v : null;
  } catch {
    return null;
  }
}

export function setAccountType(type) {
  try {
    if (type) window.localStorage.setItem(ACCOUNT_TYPE_KEY, type);
    else window.localStorage.removeItem(ACCOUNT_TYPE_KEY);
  } catch {
    /* private browsing — the server falls back to whichever profile exists */
  }
}

export async function signInWithPassword(email, password) {
  const supabase = getSupabaseBrowser();
  return supabase.auth.signInWithPassword({
    email: String(email).trim().toLowerCase(),
    password,
  });
}

export async function signUpWithPassword(email, password) {
  const supabase = getSupabaseBrowser();
  return supabase.auth.signUp({
    email: String(email).trim().toLowerCase(),
    password,
    options: { emailRedirectTo: `${window.location.origin}/` },
  });
}

export async function signOutEverywhere() {
  setAccountType(null);
  try {
    if (isSupabaseConfigured()) {
      await getSupabaseBrowser().auth.signOut();
    }
  } catch {
    /* already signed out */
  }
}

/** Subscribe to sign-in/sign-out/token-refresh. Returns an unsubscribe fn. */
export function onAuthChange(handler) {
  if (!isSupabaseConfigured()) return () => {};
  try {
    const { data } = getSupabaseBrowser().auth.onAuthStateChange((event, session) => {
      handler(event, session);
    });
    return () => data?.subscription?.unsubscribe?.();
  } catch {
    return () => {};
  }
}
