import {
  API_ERRORS,
  resolveApiErrorMessage,
} from "@shared/api-errors";

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
 */
export async function apiFetch(url, options = {}, fallbackCode = "OPERATION_FAILED") {
  try {
    const res = await fetch(url, {
      credentials: "include",
      ...options,
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
