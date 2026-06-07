import { emailButton, wrapEmailHtml } from "./base-layout";

export type RegistrationConfirmationDetails = {
  userType: "singer" | "organization";
  displayName: string;
  siteUrl: string;
};

export function buildRegistrationConfirmationEmail(
  details: RegistrationConfirmationDetails,
) {
  const isSinger = details.userType === "singer";
  const subject = isSinger
    ? "Welcome to Singer Search — registration received"
    : "Welcome to Singer Search — organization account created";

  const bodyParagraph = isSinger
    ? `<p style="color:#475569;margin:0 0 16px;">Hi ${details.displayName}, thank you for registering on Singer Search. Your profile has been created and is <strong>pending admin review</strong>. You can sign in anytime to complete your profile while you wait.</p>`
    : `<p style="color:#475569;margin:0 0 16px;">Hi ${details.displayName}, thank you for registering your organization on Singer Search. Your account is ready — sign in to start searching for singers.</p>`;

  const html = wrapEmailHtml(
    isSinger ? "Registration received" : "Organization account created",
    `${bodyParagraph}${emailButton(details.siteUrl, "Go to Singer Search")}<p style="color:#64748b;font-size:13px;margin:0;">If you did not create this account, you can ignore this email.</p>`,
  );

  const text = isSinger
    ? [
        "Welcome to Singer Search — registration received",
        "",
        `Hi ${details.displayName},`,
        "",
        "Thank you for registering. Your profile is pending admin review.",
        "You can sign in to complete your profile while you wait.",
        "",
        details.siteUrl,
      ].join("\n")
    : [
        "Welcome to Singer Search — organization account created",
        "",
        `Hi ${details.displayName},`,
        "",
        "Thank you for registering your organization. Your account is ready.",
        "",
        details.siteUrl,
      ].join("\n");

  return { subject, html, text };
}
