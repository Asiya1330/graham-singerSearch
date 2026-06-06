import { getEmailConfig, isExampleEmail } from "./config";
import { getResendClient } from "./client";
import {
  buildNewRegistrationEmail,
  type NewRegistrationDetails,
} from "./templates/new-registration";

export type { NewRegistrationDetails };

export async function notifyNewRegistration(
  details: NewRegistrationDetails,
): Promise<void> {
  if (isExampleEmail(details.email)) {
    console.log(
      `[email] Skipping notification for example.com address: ${details.email}`,
    );
    return;
  }

  const config = getEmailConfig();
  const resend = getResendClient();
  if (!config || !resend) return;

  const { subject, html, text } = buildNewRegistrationEmail(details);

  try {
    const { data, error } = await resend.emails.send({
      from: config.fromEmail,
      to: config.adminNotificationEmail,
      subject,
      html,
      text,
    });

    if (error) {
      console.error(
        `[email] Failed to send new registration notification for ${details.email}:`,
        error,
      );
      return;
    }

    console.log(
      `[email] New registration notification sent for ${details.userType} #${details.userId} (${details.email}) — id: ${data?.id ?? "unknown"}`,
    );
  } catch (err) {
    console.error(
      `[email] Unexpected error sending registration notification for ${details.email}:`,
      err,
    );
  }
}
