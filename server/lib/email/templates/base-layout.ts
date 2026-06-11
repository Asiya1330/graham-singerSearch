import { getEmailLogoUrl, getEmailUrls } from "../config";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function emailButton(href: string, label: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
      <tr>
        <td style="border-radius:6px;background:#2563eb;">
          <a href="${href}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">${escapeHtml(label)}</a>
        </td>
      </tr>
    </table>
  `.trim();
}

export function emailDetailTable(rows: Array<{ label: string; value: string }>): string {
  const tableRows = rows
    .map(
      (row) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;width:38%;vertical-align:top;">${escapeHtml(row.label)}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:14px;vertical-align:top;">${escapeHtml(row.value)}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:20px 0;">
      ${tableRows}
    </table>
  `.trim();
}

export type BrandedEmailOptions = {
  preheader?: string;
  title: string;
  bodyHtml: string;
  footerNote?: string;
};

export function wrapEmailHtml(options: BrandedEmailOptions): string {
  const urls = getEmailUrls();
  const logoUrl = getEmailLogoUrl();
  const preheader = options.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(options.preheader)}</div>`
    : "";

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(options.title)}</title>
      </head>
      <body style="margin:0;padding:0;background:#f1f5f9;">
        ${preheader}
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f1f5f9;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:28px 32px 20px;border-bottom:1px solid #e2e8f0;background:#ffffff;text-align:center;">
                    <a href="${urls.home}" style="text-decoration:none;">
                      <img src="${logoUrl}" alt="Singer Search" width="200" style="display:block;margin:0 auto;max-width:200px;height:auto;border:0;" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
                    <h1 style="margin:0 0 20px;font-size:22px;line-height:1.3;color:#0f172a;">${escapeHtml(options.title)}</h1>
                    ${options.bodyHtml}
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 32px 28px;border-top:1px solid #e2e8f0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
                    <p style="margin:0 0 8px;font-size:14px;color:#0f172a;font-weight:600;">The Singer Search Team</p>
                    <p style="margin:0 0 12px;font-size:13px;color:#64748b;line-height:1.5;">
                      Professional singer intelligence for opera companies, orchestras, and presenters.
                    </p>
                    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
                      <a href="${urls.home}" style="color:#2563eb;text-decoration:none;">${urls.home}</a>
                      &nbsp;·&nbsp;
                      <a href="mailto:${urls.supportEmail}" style="color:#2563eb;text-decoration:none;">${urls.supportEmail}</a>
                    </p>
                    ${options.footerNote ? `<p style="margin:16px 0 0;font-size:12px;color:#94a3b8;line-height:1.5;">${options.footerNote}</p>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `.trim();
}
