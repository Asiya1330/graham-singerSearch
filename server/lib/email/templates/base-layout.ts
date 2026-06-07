export function wrapEmailHtml(title: string, bodyHtml: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;color:#0f172a;">
      <h2 style="margin:0 0 16px;">${title}</h2>
      ${bodyHtml}
    </div>
  `.trim();
}

export function emailButton(href: string, label: string): string {
  return `<p style="margin:24px 0;"><a href="${href}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600;">${label}</a></p>`;
}
