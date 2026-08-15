import {
  API_ERRORS,
  resolveApiErrorMessage,
} from "@shared/api-errors";
import { getAccessToken, getAccountType } from "./supabase";

export { API_ERRORS, resolveApiErrorMessage };

/**
 * Parse JSON (or text) from a failed API response into a user-facing message.
 */
export async function getApiErrorMessage(res, fallbackCode = "OPERATION_FAILED") {
  try {
    const text = await res.text();
    if (!text) {
      if (res.status === 502 || res.status === 503) {
        return API_ERRORS.SERVICE_UNAVAILABLE.message;
      }
      return API_ERRORS[fallbackCode].message;
    }
    try {
      return resolveApiErrorMessage(JSON.parse(text), fallbackCode);
    } catch {
      return resolveApiErrorMessage({ message: text }, fallbackCode);
    }
  } catch {
    return API_ERRORS.NETWORK_ERROR.message;
  }
}

/**
 * fetch() wrapper that throws Error with a clean message when !res.ok.
 * Attaches Supabase Bearer token when a session exists (admin APIs).
 */
export async function apiFetch(url, options = {}, fallbackCode = "OPERATION_FAILED") {
  try {
    const headers = new Headers(options.headers || {});
    const token = await getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const accountType = getAccountType();
    if (accountType && !headers.has("X-Account-Type")) {
      headers.set("X-Account-Type", accountType);
    }
    if (
      options.body &&
      typeof options.body === "string" &&
      !headers.has("Content-Type")
    ) {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(url, {
      credentials: "include",
      ...options,
      headers,
    });

    if (!res.ok) {
      const message = await getApiErrorMessage(res, fallbackCode);
      const err = new Error(message);
      err.status = res.status;
      throw err;
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return { res, data: await res.json() };
    }
    return { res, data: null };
  } catch (error) {
    if (error?.status) throw error;
    throw new Error(API_ERRORS.NETWORK_ERROR.message);
  }
}

/**
 * Parse a response that may already have been read; use when handling res manually.
 */
export function getErrorMessageFromBody(body, fallbackCode = "OPERATION_FAILED") {
  return resolveApiErrorMessage(body, fallbackCode);
}

/** Browser fetch rejections — these arrive as TypeErrors with terse text. */
const BROWSER_NETWORK_MESSAGES = new Set([
  "Failed to fetch", // Chrome
  "NetworkError when attempting to fetch resource.", // Firefox
  "Load failed", // Safari
  "The Internet connection appears to be offline.",
  "cancelled",
]);

/**
 * Turns a caught exception into something worth showing a user.
 *
 * Errors thrown by `apiFetch`/`getApiErrorMessage` already carry a resolved
 * catalog message, so those pass through untouched. Raw browser network
 * failures get the connection message instead of their terse native text.
 */
export function describeError(error, fallbackCode = "OPERATION_FAILED") {
  if (typeof error === "string" && error.trim()) return error;

  const message = typeof error?.message === "string" ? error.message.trim() : "";
  if (!message) return API_ERRORS[fallbackCode]?.message ?? API_ERRORS.OPERATION_FAILED.message;

  if (BROWSER_NETWORK_MESSAGES.has(message) || error?.name === "TypeError") {
    return API_ERRORS.NETWORK_ERROR.message;
  }
  if (error?.name === "AbortError") {
    return "That request was cancelled before it finished. Please try again.";
  }
  // A SyntaxError here means res.json() choked on a non-JSON body — typically a
  // proxy's HTML error page. "Unexpected token '<'" helps nobody.
  if (error?.name === "SyntaxError") {
    return API_ERRORS.SERVICE_UNAVAILABLE.message;
  }
  return message;
}
