import { emailButton, wrapEmailHtml } from "./base-layout";

export type PasswordResetDetails = {
  displayName: string;
  resetUrl: string;
  userType: "singer" | "organization";
};

export function buildPasswordResetEmail(details: PasswordResetDetails) {
  const accountLabel =
    details.userType === "singer" ? "singer account" : "organization account";
  const subject = "Reset your Singer Search password";

  const html = wrapEmailHtml(
    "Password reset",
    `<p style="color:#475569;margin:0 0 16px;">Hi ${details.displayName}, we received a request to reset the password for your ${accountLabel}.</p>${emailButton(details.resetUrl, "Reset password")}<p style="color:#64748b;font-size:13px;margin:0;">This link expires in 1 hour and can only be used once. If you did not request a reset, you can safely ignore this email.</p>`,
  );

  const text = [
    subject,
    "",
    `Hi ${details.displayName},`,
    "",
    `Reset your password using this link (expires in 1 hour):`,
    details.resetUrl,
    "",
    "If you did not request this, ignore this email.",
  ].join("\n");

  return { subject, html, text };
}
