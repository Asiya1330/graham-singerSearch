import { emailButton, wrapEmailHtml } from "./base-layout";

export type SingerApprovedDetails = {
  displayName: string;
  siteUrl: string;
};

export function buildSingerApprovedEmail(details: SingerApprovedDetails) {
  const subject = "Your Singer Search profile has been approved";

  const html = wrapEmailHtml(
    "Profile approved",
    `<p style="color:#475569;margin:0 0 16px;">Hi ${details.displayName}, great news — your Singer Search profile has been <strong>approved</strong>. You are now visible to organizations searching for singers.</p>${emailButton(details.siteUrl, "View your dashboard")}<p style="color:#64748b;font-size:13px;margin:0;">Sign in to review your profile and keep your information up to date.</p>`,
  );

  const text = [
    subject,
    "",
    `Hi ${details.displayName},`,
    "",
    "Your Singer Search profile has been approved. You are now visible in search results.",
    "",
    details.siteUrl,
  ].join("\n");

  return { subject, html, text };
}
