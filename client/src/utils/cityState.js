import cityToState from "../data/cityToState.json";

function normalize(city) {
  if (!city || typeof city !== "string") return "";
  return city
    .trim()
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/[,'`]/g, "")
    .replace(/\s+/g, " ");
}

export function lookupStateForCity(city) {
  const key = normalize(city);
  if (!key) return null;
  if (cityToState[key]) return cityToState[key];
  const noSuffix = key.replace(/\s+(ny|ca|tx|fl|il|pa|oh|mi|ga|nc|tn|ma|wa|co|wi|mn|mo|md|la|ky|or|ok|nv|nm|ut|id|ia|ks|ct|nj|nh|vt|me|ri|va|wv|sc|al|ms|nd|sd|mt|wy|ne|de|ar|in|az|hi|ak|dc)$/i, "");
  if (noSuffix !== key && cityToState[noSuffix]) return cityToState[noSuffix];
  return null;
}

export default lookupStateForCity;
