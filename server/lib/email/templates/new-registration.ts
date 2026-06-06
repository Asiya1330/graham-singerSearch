export type NewRegistrationDetails = {
  userType: "singer" | "organization";
  userId: number;
  email: string;
  displayName: string;
  city?: string | null;
  state?: string | null;
  detailLabel?: string | null;
  detailValue?: string | null;
  isFoundingMember: boolean;
  registeredAt: Date;
};

function formatLocation(city?: string | null, state?: string | null): string {
  const parts = [city?.trim(), state?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Not provided";
}

function formatTimestamp(date: Date): string {
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }) + " UTC";
}

export function buildNewRegistrationEmail(details: NewRegistrationDetails) {
  const userTypeLabel =
    details.userType === "singer" ? "Singer" : "Organization";
  const subject = `New ${userTypeLabel} registration — ${details.displayName}`;
  const location = formatLocation(details.city, details.state);
  const foundingStatus = details.isFoundingMember
    ? "Yes (Founding Member)"
    : "No";

  const detailRow =
    details.detailLabel && details.detailValue
      ? `<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;">${details.detailLabel}</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${details.detailValue}</td></tr>`
      : "";

  const detailText =
    details.detailLabel && details.detailValue
      ? `${details.detailLabel}: ${details.detailValue}\n`
      : "";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;color:#0f172a;">
      <h2 style="margin:0 0 16px;">New ${userTypeLabel} Registration</h2>
      <p style="color:#475569;margin:0 0 20px;">A new user signed up on Singer Search.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;">User type</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${userTypeLabel}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;">Name</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${details.displayName}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;">Email</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${details.email}</td></tr>
        ${detailRow}
        <tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;">Location</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${location}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;">Founding member</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${foundingStatus}</td></tr>
        <tr><td style="padding:8px 12px;color:#64748b;">User ID</td><td style="padding:8px 12px;">${details.userId}</td></tr>
        <tr><td style="padding:8px 12px;color:#64748b;">Registered at</td><td style="padding:8px 12px;">${formatTimestamp(details.registeredAt)}</td></tr>
      </table>
    </div>
  `.trim();

  const text = [
    `New ${userTypeLabel} Registration`,
    "",
    `Name: ${details.displayName}`,
    `Email: ${details.email}`,
    detailText.trim(),
    `Location: ${location}`,
    `Founding member: ${foundingStatus}`,
    `User ID: ${details.userId}`,
    `Registered at: ${formatTimestamp(details.registeredAt)}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}
