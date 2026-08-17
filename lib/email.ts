import "server-only";

/**
 * Thin wrapper over Resend. If RESEND_API_KEY isn't configured (e.g. local dev
 * or this preview branch), emails are logged to the server console and reported
 * as `simulated` instead of failing — so the interest flow works end to end
 * without credentials, and lights up for real the moment a key is added.
 */

interface SendArgs {
  to: string | string[];
  cc?: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export type SendResult = { ok: true; simulated: boolean } | { ok: false; error: string };

const FROM = process.env.EMAIL_FROM ?? "T4SG Engineering <engineering@t4sg.dev>";

export async function sendEmail({ to, subject, html, replyTo, cc }: SendArgs): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    const recipientLabel = Array.isArray(to) ? to.join(", ") : to;
    // eslint-disable-next-line no-console
    console.info(`[email:simulated] → ${recipientLabel} · "${subject}" (set RESEND_API_KEY to send for real)`);
    return { ok: true, simulated: true };
  }

  try {
    // Imported lazily so the package is only pulled in when a key exists.
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      ...(cc ? { cc } : {}),
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, simulated: false };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}

/** Wrap body copy in a simple, on-brand HTML shell. */
export function emailShell(heading: string, body: string): string {
  return `<div style="font-family:Georgia,'Times New Roman',serif;max-width:520px;margin:0 auto;color:#20201c">
    <p style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#6f685a;margin:0 0 8px">Tech for Social Good</p>
    <h1 style="font-size:22px;font-weight:600;margin:0 0 16px;line-height:1.25">${heading}</h1>
    <div style="font-size:15px;line-height:1.6">${body}</div>
    <hr style="border:none;border-top:1px solid #ded7c8;margin:24px 0" />
    <p style="font-size:12px;color:#6f685a;margin:0">Harvard Computer Society · Social Good Marketplace</p>
  </div>`;
}
