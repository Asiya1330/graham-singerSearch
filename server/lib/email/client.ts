import { Resend } from "resend";
import { getEmailConfig } from "./config";

let client: Resend | null = null;

export function getResendClient(): Resend | null {
  const config = getEmailConfig();
  if (!config) return null;

  if (!client) {
    client = new Resend(config.apiKey);
  }

  return client;
}

export function resetResendClientForTests(): void {
  client = null;
}
