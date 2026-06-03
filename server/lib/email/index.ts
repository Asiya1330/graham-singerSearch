import {
  getEmailConfig,
  getEmailConfigStatus,
  isExampleEmail,
  logEmailConfigStatus,
} from "./config";
import { getResendClient } from "./client";
import {
  buildNewRegistrationEmail,
  type NewRegistrationDetails,
} from "./templates/new-registration";

export type { NewRegistrationDetails, EmailConfigStatus };
export { getEmailConfigStatus, logEmailConfigStatus };

export type EmailSendResult = {
  ok: boolean;
  message: string;
  resendId?: string;
  error?: unknown;
};

async function sendAdminEmail(
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

  console.log(
    `[email] ${logContext} — sending from=${config.fromEmail} to=${config.adminNotificationEmail}`,
  );

  try {
    const { data, error } = await resend.emails.send({
      from: config.fromEmail,
      to: config.adminNotificationEmail,
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
    `registration notification for ${details.email}`,
  );
}

export async function sendTestEmail(): Promise<EmailSendResult> {
  const status = getEmailConfigStatus();
  const timestamp = new Date().toISOString();

  return sendAdminEmail(
    "Singer Search — test email",
    `<p>This is a test email from Singer Search sent at <strong>${timestamp}</strong>.</p><p>If you received this, Resend is configured correctly on Railway.</p>`,
    `This is a test email from Singer Search sent at ${timestamp}. If you received this, Resend is configured correctly on Railway.`,
    "test email",
  );
}
