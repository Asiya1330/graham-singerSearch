import { emailButton, escapeHtml, wrapEmailHtml } from "./base-layout";
import { getEmailUrls } from "../config";

export type RegistrationConfirmationDetails = {
  userType: "singer" | "organization";
  displayName: string;
  siteUrl: string;
};

export function buildRegistrationConfirmationEmail(
  details: RegistrationConfirmationDetails,
) {
  const isSinger = details.userType === "singer";
  const urls = getEmailUrls();
  const subject = isSinger
    ? "Welcome to Singer Search — registration received"
    : "Welcome to Singer Search — organization account created";

  const loginUrl = isSinger ? urls.singerLogin : urls.organizationLogin;
  const loginLabel = isSinger ? "Sign in to your singer account" : "Sign in to your organization account";

  const bodyHtml = isSinger
    ? `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">Hi ${escapeHtml(details.displayName)},</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">
        Thank you for registering on Singer Search. Your profile has been created and is
        <strong>pending admin review</strong>. You can sign in anytime to complete your profile while you wait.
      </p>
      <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#475569;">What happens next:</p>
      <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.7;color:#475569;">
        <li>Complete your profile, repertoire, and availability</li>
        <li>Our team will review your registration</li>
        <li>Once approved, your profile becomes visible to organizations</li>
      </ul>
      ${emailButton(loginUrl, loginLabel)}
    `
    : `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">Hi ${escapeHtml(details.displayName)},</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">
        Thank you for registering your organization on Singer Search. Your account is ready —
        sign in to start searching for singers and building your shortlist.
      </p>
      ${emailButton(loginUrl, loginLabel)}
    `;

  const html = wrapEmailHtml({
    preheader: isSinger
      ? "Your Singer Search registration was received and is pending review."
      : "Your Singer Search organization account is ready.",
    title: isSinger ? "Registration received" : "Organization account created",
    bodyHtml,
    footerNote: "If you did not create this account, you can safely ignore this email.",
  });

  const text = isSinger
    ? [
        subject,
        "",
        `Hi ${details.displayName},`,
        "",
        "Thank you for registering. Your profile is pending admin review.",
        "Sign in to complete your profile:",
        loginUrl,
      ].join("\n")
    : [
        subject,
        "",
        `Hi ${details.displayName},`,
        "",
        "Your organization account is ready.",
        "Sign in:",
        loginUrl,
      ].join("\n");

  return { subject, html, text };
}
