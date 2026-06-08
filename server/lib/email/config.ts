export type EmailConfig = {
  apiKey: string;
  fromEmail: string;
  adminNotificationEmail: string;
};

export type EmailConfigStatus = {
  enabled: boolean;
  ready: boolean;
  issues: string[];
  fromEmail: string | null;
  adminNotificationEmail: string | null;
  apiKeySet: boolean;
  apiKeyHint: string | null;
};

export function isExampleEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1];
  return domain === "example.com";
}

export function isEmailNotificationsEnabled(): boolean {
  if (process.env.EMAIL_NOTIFICATIONS_ENABLED === "false") return false;
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function getEmailConfigStatus(): EmailConfigStatus {
  const apiKey = process.env.RESEND_API_KEY?.trim() ?? "";
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() ?? "";
  const adminNotificationEmail =
    process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ?? "";
  const issues: string[] = [];

  if (process.env.EMAIL_NOTIFICATIONS_ENABLED === "false") {
    issues.push("EMAIL_NOTIFICATIONS_ENABLED is set to false");
  }

  if (!apiKey) {
    issues.push("RESEND_API_KEY is missing or empty");
  }

  if (apiKey && !fromEmail) {
    issues.push("RESEND_FROM_EMAIL is missing or empty");
  }

  if (apiKey && !adminNotificationEmail) {
    issues.push("ADMIN_NOTIFICATION_EMAIL is missing or empty");
  }

  const enabled = isEmailNotificationsEnabled();
  const ready = enabled && issues.length === 0;

  return {
    enabled,
    ready,
    issues,
    fromEmail: fromEmail || null,
    adminNotificationEmail: adminNotificationEmail || null,
    apiKeySet: Boolean(apiKey),
    apiKeyHint: apiKey ? `${apiKey.slice(0, 8)}…` : null,
  };
}

export function getEmailConfig(): EmailConfig | null {
  const status = getEmailConfigStatus();
  if (!status.ready) return null;
  return {
    apiKey: process.env.RESEND_API_KEY!.trim(),
    fromEmail: status.fromEmail!,
    adminNotificationEmail: status.adminNotificationEmail!,
  };
}

export function getSiteUrl(): string {
  const url = process.env.SITE_URL?.trim();
  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") {
    return "https://singersearch.net";
  }
  return `http://localhost:${process.env.PORT || "5000"}`;
}

export function getEmailLogoUrl(): string {
  const override = process.env.EMAIL_LOGO_URL?.trim();
  if (override) return override;
  return `${getSiteUrl()}/singer-search-logo.png`;
}

export function getEmailUrls() {
  const siteUrl = getSiteUrl();
  return {
    home: siteUrl,
    singerLogin: `${siteUrl}/login/singer`,
    organizationLogin: `${siteUrl}/login/organization`,
    privacy: `${siteUrl}/privacy`,
    supportEmail: process.env.SUPPORT_EMAIL?.trim() || "support@singersearch.net",
  };
}

export function logEmailConfigStatus(source = "startup"): void {
  const status = getEmailConfigStatus();
  if (status.ready) {
    console.log(
      `[email] Ready (${source}) — from=${status.fromEmail} to=${status.adminNotificationEmail} key=${status.apiKeyHint}`,
    );
    return;
  }

  console.warn(
    `[email] Not ready (${source}) — ${status.issues.join("; ") || "unknown issue"}`,
  );
}
