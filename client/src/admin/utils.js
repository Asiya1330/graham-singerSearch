export function getStatusBadge(singer) {
  if (singer.subscription_status === "inactive") return { label: "Inactive", color: "bg-slate-100 text-slate-600" };
  if (singer.admin_approved) return { label: "Profile Approved", color: "bg-emerald-100 text-emerald-700" };
  if (singer.admin_rejected) return { label: "Rejected", color: "bg-red-100 text-red-700" };
  return { label: "Pending Approval", color: "bg-amber-100 text-amber-700" };
}

export function getOrgBalance(org) {
  return (org.contact_reveal_limit ?? 0) - (org.contact_reveals_used_this_month ?? 0);
}

export function filterSingers(allSingers, adminTab, singerSearchQuery) {
  return allSingers.filter((s) => {
    const q = singerSearchQuery.trim().toLowerCase();
    if (q) {
      const fullName = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
      return fullName.includes(q) || (s.email || "").toLowerCase().includes(q);
    }
    if (adminTab === "pending" && !(!s.admin_approved && !s.admin_rejected && s.subscription_status !== "inactive")) return false;
    if (adminTab === "rejected" && !(!s.admin_approved && s.admin_rejected && s.subscription_status !== "inactive")) return false;
    if (adminTab === "approved" && !(s.admin_approved && s.subscription_status !== "inactive")) return false;
    if (adminTab === "inactive" && s.subscription_status !== "inactive") return false;
    if (adminTab === "requests" && !(s.emergency_status_requested === true && !s.is_emergency_ready)) return false;
    return true;
  });
}

export function buildOrgEditForm(org) {
  return {
    organization_name: org.organization_name || "",
    email: org.email || "",
    city: org.city || "",
    contact_person_name: org.contact_person_name || "",
    contact_person_email: org.contact_person_email || "",
    subscription_tier: org.subscription_tier || "free",
    admin_notes: org.admin_notes || "",
  };
}

export function buildSingerEditForm(singer) {
  return {
    first_name: singer.first_name || "",
    last_name: singer.last_name || "",
    email: singer.email || "",
    primary_voice_type: singer.primary_voice_type || "",
    primary_fach: singer.primary_fach || "",
    city: singer.city || "",
    state: singer.state || "",
    union_status: singer.union_status || "",
    subscription_tier: singer.subscription_tier || "free",
    short_bio: singer.short_bio || "",
    admin_notes: singer.admin_notes || "",
  };
}
