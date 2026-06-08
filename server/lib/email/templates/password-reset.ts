import { emailButton, escapeHtml, wrapEmailHtml } from "./base-layout";

export type PasswordResetDetails = {
  displayName: string;
  resetUrl: string;
  userType: "singer" | "organization";
};

export function buildPasswordResetEmail(details: PasswordResetDetails) {
  const accountLabel =
    details.userType === "singer" ? "singer account" : "organization account";
  const subject = "Reset your Singer Search password";

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">Hi ${escapeHtml(details.displayName)},</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">
      We received a request to reset the password for your ${accountLabel}.
      Click the button below to choose a new password.
    </p>
    ${emailButton(details.resetUrl, "Reset password")}
    <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">
      This link expires in <strong>1 hour</strong> and can only be used once.
      If the button does not work, copy and paste this URL into your browser:<br />
      <a href="${details.resetUrl}" style="color:#2563eb;word-break:break-all;">${escapeHtml(details.resetUrl)}</a>
    </p>
  `;

  const html = wrapEmailHtml({
    preheader: "Reset your Singer Search password. This link expires in 1 hour.",
    title: "Password reset",
    bodyHtml,
    footerNote: "If you did not request a password reset, you can safely ignore this email.",
  });

  const text = [
    subject,
    "",
    `Hi ${details.displayName},`,
    "",
    "Reset your password using this link (expires in 1 hour):",
    details.resetUrl,
    "",
    "If you did not request this, ignore this email.",
  ].join("\n");

  return { subject, html, text };
}
