const FILE_FIELDS = ["headshot_url", "resume_url"];

export function isHttpFileUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}

/** Storage object paths are not valid img/href values; only signed or public http(s) URLs are. */
export function displayFileUrl(value) {
  return isHttpFileUrl(value) ? value.trim() : null;
}

/**
 * Merge API user payloads into session state without replacing a working signed
 * file URL with a raw storage path (which the browser would load from our origin).
 */
export function mergeUserData(prevData = {}, incoming = {}) {
  const next = { ...prevData, ...incoming };
  for (const field of FILE_FIELDS) {
    const incomingVal = incoming[field];
    const prevVal = prevData[field];
    if (!isHttpFileUrl(incomingVal) && isHttpFileUrl(prevVal)) {
      next[field] = prevVal;
    }
  }
  return next;
}

export function mergeCurrentUser(prev, incoming) {
  if (!incoming) return prev;
  if (prev?.data) {
    return { ...prev, data: mergeUserData(prev.data, incoming) };
  }
  return { ...prev, data: incoming };
}
