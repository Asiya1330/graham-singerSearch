import { adminFetch } from "../lib/adminApi";

export async function fetchSingerDetail(singerId) {
  const res = await adminFetch(`/api/admin/singers/${singerId}`);
  if (!res.ok) throw new Error("Failed to load singer");
  return res.json();
}

export async function fetchOrgDetail(orgId) {
  const res = await adminFetch(`/api/admin/orgs/${orgId}`);
  if (!res.ok) throw new Error("Failed to load");
  const orgData = await res.json();
  const adjRes = await adminFetch(`/api/admin/orgs/${orgId}/credit-adjustments`);
  const adjustments = adjRes.ok ? await adjRes.json() : [];
  return { ...orgData, credit_adjustments: adjustments };
}
