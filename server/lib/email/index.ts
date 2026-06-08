import {
  getEmailConfig,
  getEmailConfigStatus,
  getSiteUrl,
  isExampleEmail,
  logEmailConfigStatus,
} from "./config";
import { getResendClient } from "./client";
import {
  buildNewRegistrationEmail,
  type NewRegistrationDetails,
} from "./templates/new-registration";
import { buildRegistrationConfirmationEmail } from "./templates/registration-confirmation";
import { buildSingerApprovedEmail } from "./templates/singer-approved";
import { buildPasswordResetEmail } from "./templates/password-reset";
import { wrapEmailHtml, emailButton } from "./templates/base-layout";

export type { NewRegistrationDetails, EmailConfigStatus };
export { getEmailConfigStatus, getSiteUrl, logEmailConfigStatus };

export type EmailSendResult = {
  ok: boolean;
  message: string;
  resendId?: string;
  error?: unknown;
};

async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string,
  logContext: string,
): Promise<EmailSendResult> {
  const status = getEmailConfigStatus();
  if (!status.ready) {
    const message = status.issues.join("; ") || "Email is not configured";
    console.warn(`[email] ${logContext} skipped — ${message}`);
    return { ok: false, message };
  }

  const config = getEmailConfig()!;
  const resend = getResendClient();
  if (!resend) {
    const message = "Resend client failed to initialize";
    console.error(`[email] ${logContext} failed — ${message}`);
    return { ok: false, message };
  }

  console.log(`[email] ${logContext} — sending from=${config.fromEmail} to=${to}`);

  try {
    const { data, error } = await resend.emails.send({
      from: config.fromEmail,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error(`[email] ${logContext} failed — Resend error:`, error);
      return { ok: false, message: "Resend rejected the send request", error };
    }

    const resendId = data?.id ?? undefined;
    console.log(
      `[email] ${logContext} succeeded — resendId=${resendId ?? "unknown"}`,
    );
    return {
      ok: true,
      message: "Email sent successfully",
      resendId,
    };
  } catch (err) {
    console.error(`[email] ${logContext} failed — unexpected error:`, err);
    return { ok: false, message: "Unexpected error while sending email", error: err };
  }
}

async function sendAdminEmail(
  subject: string,
  html: string,
  text: string,
  logContext: string,
): Promise<EmailSendResult> {
  const config = getEmailConfig();
  if (!config) {
    return sendEmail("", subject, html, text, logContext);
  }
  return sendEmail(config.adminNotificationEmail, subject, html, text, logContext);
}

async function sendUserEmail(
  to: string,
  subject: string,
  html: string,
  text: string,
  logContext: string,
): Promise<EmailSendResult> {
  return sendEmail(to, subject, html, text, logContext);
}

export async function notifyNewRegistration(
  details: NewRegistrationDetails,
): Promise<void> {
  console.log(
    `[email] Registration hook fired — type=${details.userType} id=${details.userId} email=${details.email}`,
  );

  if (isExampleEmail(details.email)) {
    console.log(
      `[email] Skipping notification for example.com address: ${details.email}`,
    );
    return;
  }

  const { subject, html, text } = buildNewRegistrationEmail(details);
  await sendAdminEmail(
    subject,
    html,
    text,
    `admin registration notification for ${details.email}`,
  );
}

export async function notifyRegistrationConfirmation(details: {
  userType: "singer" | "organization";
  email: string;
  displayName: string;
}): Promise<void> {
  if (isExampleEmail(details.email)) return;

  const siteUrl = getSiteUrl();
  const { subject, html, text } = buildRegistrationConfirmationEmail({
    userType: details.userType,
    displayName: details.displayName,
    siteUrl,
  });

  await sendUserEmail(
    details.email,
    subject,
    html,
    text,
    `registration confirmation for ${details.email}`,
  );
}

export async function notifySingerApproved(details: {
  email: string;
  displayName: string;
}): Promise<void> {
  if (isExampleEmail(details.email)) return;

  const siteUrl = getSiteUrl();
  const { subject, html, text } = buildSingerApprovedEmail({
    displayName: details.displayName,
    siteUrl,
  });

  await sendUserEmail(
    details.email,
    subject,
    html,
    text,
    `singer approved notification for ${details.email}`,
  );
}

export async function notifyPasswordReset(details: {
  userType: "singer" | "organization";
  email: string;
  displayName: string;
  resetToken: string;
}): Promise<void> {
  if (isExampleEmail(details.email)) return;

  const siteUrl = getSiteUrl();
  const resetUrl = `${siteUrl}/reset-password?token=${encodeURIComponent(details.resetToken)}&type=${details.userType}`;
  const { subject, html, text } = buildPasswordResetEmail({
    userType: details.userType,
    displayName: details.displayName,
    resetUrl,
  });

  await sendUserEmail(
    details.email,
    subject,
    html,
    text,
    `password reset for ${details.email}`,
  );
}

export async function sendTestEmail(): Promise<EmailSendResult> {
  const timestamp = new Date().toISOString();
  const siteUrl = getSiteUrl();

  const html = wrapEmailHtml({
    preheader: "Singer Search test email — Resend is configured correctly.",
    title: "Test email",
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">
        This is a test email from Singer Search sent at <strong>${timestamp}</strong>.
      </p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#475569;">
        If you received this message with the logo and footer intact, Resend is configured correctly.
      </p>
      ${emailButton(siteUrl, "Visit Singer Search")}
    `,
  });

  return sendAdminEmail(
    "Singer Search — test email",
    html,
    `This is a test email from Singer Search sent at ${timestamp}. If you received this, Resend is configured correctly. ${siteUrl}`,
    "test email",
  );
}
