import { emailButton, escapeHtml, wrapEmailHtml } from "./base-layout";
import { getEmailUrls } from "../config";

export type SingerApprovedDetails = {
  displayName: string;
  siteUrl: string;
};

export function buildSingerApprovedEmail(details: SingerApprovedDetails) {
  const urls = getEmailUrls();
  const subject = "Your Singer Search profile has been approved";

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">Hi ${escapeHtml(details.displayName)},</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">
      Great news — your Singer Search profile has been <strong>approved</strong>.
      You are now visible to organizations searching for singers.
    </p>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#475569;">We recommend:</p>
    <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.7;color:#475569;">
      <li>Keep your headshot, bio, and repertoire up to date</li>
      <li>Add availability so you appear in date-based searches</li>
      <li>Review your profile from your dashboard</li>
    </ul>
    ${emailButton(urls.singerLogin, "Go to your dashboard")}
  `;

  const html = wrapEmailHtml({
    preheader: "Your Singer Search profile is now live in search results.",
    title: "Profile approved",
    bodyHtml,
    footerNote: "Questions? Reply to this email or contact support@singersearch.net.",
  });

  const text = [
    subject,
    "",
    `Hi ${details.displayName},`,
    "",
    "Your Singer Search profile has been approved. You are now visible in search results.",
    "",
    urls.singerLogin,
  ].join("\n");

  return { subject, html, text };
}
