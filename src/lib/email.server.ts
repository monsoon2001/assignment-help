import "server-only";
import { SITE_URL } from "@/lib/seo";

/**
 * Transactional email sender.
 *
 * Uses Resend's HTTP API over `fetch` so no extra dependency is required. When
 * `RESEND_API_KEY` is unset (e.g. local dev without a provider) the message is
 * logged and skipped — email is best-effort and must never break a request.
 *
 * Configure:
 *   RESEND_API_KEY   re_...            (enables sending)
 *   EMAIL_FROM       "Acadivo <noreply@yourdomain.com>"
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export interface EmailMessage {
  to: (string | null | undefined)[];
  subject: string;
  /** Plain-text body; an HTML version is generated automatically. */
  text: string;
  /** Optional app path appended as a call-to-action button. */
  link?: string;
  linkLabel?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function emailFrom(): string {
  return process.env.EMAIL_FROM?.trim() || "Acadivo <notifications@acadivo.com>";
}

export function emailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function renderHtml(message: EmailMessage): string {
  const cta =
    message.link && message.linkLabel
      ? `<tr><td style="padding:4px 24px 20px;">
           <a href="${SITE_URL}${message.link}" style="display:inline-block;background:#2563EB;color:#ffffff;padding:11px 20px;border-radius:10px;font-weight:600;text-decoration:none;font-size:15px;">${escapeHtml(
             message.linkLabel,
           )}</a>
         </td></tr>`
      : "";

  return `<!doctype html>
<html>
  <body style="margin:0;background:#F8FAFC;padding:24px 12px;font-family:'Helvetica Neue',Arial,sans-serif;color:#0F172A;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #E2E8F0;border-radius:14px;overflow:hidden;">
      <tr><td style="padding:20px 24px;border-bottom:1px solid #E2E8F0;font-size:17px;font-weight:700;">Acadivo</td></tr>
      <tr>
        <td style="padding:24px 24px 8px;">
          <p style="margin:0 0 12px;font-size:16px;font-weight:600;">${escapeHtml(message.subject)}</p>
          <p style="margin:0;font-size:15px;line-height:1.6;color:#475569;white-space:pre-line;">${escapeHtml(
            message.text,
          )}</p>
        </td>
      </tr>
      ${cta}
      <tr>
        <td style="padding:16px 24px 24px;font-size:12px;color:#475569;">
          You're receiving this because you have an Acadivo account related to this activity.
          <a href="${SITE_URL}/notifications" style="color:#2563EB;text-decoration:none;">View in your portal</a>.
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Sends an email via Resend. Never throws: returns false when disabled or on
 * failure so callers can `void sendEmail(...)` from any request path.
 */
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  const recipients = message.to.filter((v): v is string => Boolean(v && v.includes("@")));
  if (recipients.length === 0) return false;

  if (!emailEnabled()) {
    console.info(
      `[email] disabled (set RESEND_API_KEY) — skipped "${message.subject}" to ${recipients.join(", ")}`,
    );
    return false;
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailFrom(),
        to: recipients,
        subject: message.subject,
        text: message.text,
        html: renderHtml(message),
      }),
    });
    if (!response.ok) {
      console.error("[email] send failed", response.status, await response.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] send error", error);
    return false;
  }
}
