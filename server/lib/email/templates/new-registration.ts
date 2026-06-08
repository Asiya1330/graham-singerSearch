import { emailButton, emailDetailTable, escapeHtml, wrapEmailHtml } from "./base-layout";
import { getEmailUrls } from "../config";

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
  const urls = getEmailUrls();

  const rows = [
    { label: "User type", value: userTypeLabel },
    { label: "Name", value: details.displayName },
    { label: "Email", value: details.email },
    ...(details.detailLabel && details.detailValue
      ? [{ label: details.detailLabel, value: details.detailValue }]
      : []),
    { label: "Location", value: location },
    { label: "Founding member", value: foundingStatus },
    { label: "User ID", value: String(details.userId) },
    { label: "Registered at", value: formatTimestamp(details.registeredAt) },
  ];

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">
      A new ${escapeHtml(userTypeLabel.toLowerCase())} registration was submitted on Singer Search.
      Review the details below in the admin dashboard.
    </p>
    ${emailDetailTable(rows)}
    ${emailButton(urls.home, "Open admin dashboard")}
  `;

  const html = wrapEmailHtml({
    preheader: `New ${userTypeLabel} registration from ${details.displayName}.`,
    title: `New ${userTypeLabel} registration`,
    bodyHtml,
  });

  const detailText =
    details.detailLabel && details.detailValue
      ? `${details.detailLabel}: ${details.detailValue}\n`
      : "";

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
    "",
    urls.home,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}
