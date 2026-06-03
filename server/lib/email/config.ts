export type EmailConfig = {
  apiKey: string;
  fromEmail: string;
  adminNotificationEmail: string;
};

let loggedDisabled = false;

export function isExampleEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1];
  return domain === "example.com";
}

export function isEmailNotificationsEnabled(): boolean {
  if (process.env.EMAIL_NOTIFICATIONS_ENABLED === "false") return false;
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function getEmailConfig(): EmailConfig | null {
  if (!isEmailNotificationsEnabled()) {
    if (!loggedDisabled) {
      console.warn(
        "[email] Notifications disabled — set RESEND_API_KEY (and related vars) to enable.",
      );
      loggedDisabled = true;
    }
    return null;
  }

  const apiKey = process.env.RESEND_API_KEY!.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
  const adminNotificationEmail =
    process.env.ADMIN_NOTIFICATION_EMAIL?.trim();

  if (!fromEmail) {
    console.warn(
      "[email] RESEND_FROM_EMAIL is required when RESEND_API_KEY is set.",
    );
    return null;
  }

  if (!adminNotificationEmail) {
    console.warn(
      "[email] ADMIN_NOTIFICATION_EMAIL is required when RESEND_API_KEY is set.",
    );
    return null;
  }

  return { apiKey, fromEmail, adminNotificationEmail };
}
