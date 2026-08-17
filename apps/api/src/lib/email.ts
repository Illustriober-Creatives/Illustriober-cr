/**
 * Transactional email via Resend Node.js SDK
 * Official guide: https://resend.com/docs
 *
 * Setup:
 * 1. Create API key at https://resend.com/settings/api-keys
 * 2. Verify domain at https://resend.com/domains
 * 3. Store RESEND_API_KEY in environment variables
 */

import { Resend } from "resend";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return null;
  }
  return new Resend(key);
}

/**
 * Send enquiry confirmation email to client and notification to admin
 * Uses idempotency keys to prevent duplicate emails when retrying
 */
export async function sendEnquiryEmails(params: {
  enquiryId: string;
  clientEmail: string;
  clientName: string;
  projectType: string;
  description: string;
}): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  const from = process.env.ENQUIRY_FROM_EMAIL;
  const adminTo = process.env.ENQUIRY_ADMIN_EMAIL;

  if (!resend || !from) {
    console.warn(
      "Resend API key or ENQUIRY_FROM_EMAIL not configured. Skipping email. Set RESEND_API_KEY and ENQUIRY_FROM_EMAIL in .env"
    );
    return { success: false, error: "Email service not configured" };
  }

  const { enquiryId, clientEmail, clientName, projectType, description } = params;

  // Send client confirmation email
  const { data: clientData, error: clientError } = await resend.emails.send({
    from,
    to: clientEmail,
    subject: "We received your project enquiry — Illustriober Creatives",
    html: `
      <p>Hi ${escapeHtml(clientName)},</p>
      <p>Thanks for reaching out. We've received your enquiry about <strong>${escapeHtml(projectType)}</strong> and will review it shortly.</p>
      <p><strong>Reference:</strong> ${escapeHtml(enquiryId)}</p>
      <p>— Illustriober Creatives</p>
    `,
    tags: [{ name: "type", value: "enquiry-confirmation" }],
  });

  if (clientError) {
    console.error("Failed to send client enquiry email:", clientError);
    return { success: false, error: clientError.message };
  }

  console.log(`✓ Client email sent (ID: ${clientData?.id})`);

  // Send admin notification email (if configured)
  if (adminTo) {
    const { data: adminData, error: adminError } = await resend.emails.send({
      from,
      to: adminTo,
      subject: `[Enquiry] ${clientName} — ${projectType}`,
      html: `
        <p><strong>New enquiry received</strong></p>
        <ul>
          <li><strong>ID:</strong> ${escapeHtml(enquiryId)}</li>
          <li><strong>From:</strong> ${escapeHtml(clientName)} (${escapeHtml(clientEmail)})</li>
          <li><strong>Project type:</strong> ${escapeHtml(projectType)}</li>
        </ul>
        <p><strong>Message:</strong></p>
        <pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(description)}</pre>
      `,
      tags: [{ name: "type", value: "enquiry-admin" }],
    });

    if (adminError) {
      console.error("Failed to send admin enquiry email:", adminError);
      return { success: false, error: adminError.message };
    }

    console.log(`✓ Admin email sent (ID: ${adminData?.id})`);
  }

  return { success: true };
}

export async function sendInviteEmail(params: {
  to: string;
  inviteUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  const from = process.env.ENQUIRY_FROM_EMAIL;

  if (!resend || !from) {
    console.warn("[email] Invite email skipped — RESEND_API_KEY or ENQUIRY_FROM_EMAIL not set");
    return { success: false, error: "Email service not configured" };
  }

  const { data, error } = await resend.emails.send({
    from,
    to: params.to,
    subject: "You've been invited to Illustriober Creatives",
    html: `
      <p>You've been invited to the Illustriober Creatives client portal.</p>
      <p><a href="${params.inviteUrl}">Accept your invitation</a></p>
      <p>This link expires in 7 days.</p>
    `,
    tags: [{ name: "type", value: "client-invite" }],
  });

  if (error) {
    console.error("[email] Failed to send invite:", error);
    return { success: false, error: error.message };
  }

  console.log(`[email] Invite sent (ID: ${data?.id})`);
  return { success: true };
}

export async function sendStaceyResponseEmail(params: {
  activity: string;
  preferredDate: string;
  timeOfDay: string;
  foodDrink?: string;
  movieTaste?: string;
  perfectNote?: string;
}): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  const from = process.env.STACEY_EMAIL_FROM || process.env.ENQUIRY_FROM_EMAIL;
  const to = process.env.STACEY_RESPONSE_EMAIL;

  if (!resend || !from || !to) {
    console.warn("[stacey] Email skipped — set RESEND_API_KEY, STACEY_EMAIL_FROM, and STACEY_RESPONSE_EMAIL");
    return { success: false, error: "Email service not configured" };
  }

  const labels: Record<string, string> = {
    "date-night": "Date night",
    "movie-night": "Movie night",
    "date-and-movie": "Date and movie night",
    afternoon: "Afternoon",
    evening: "Evening",
    night: "Night",
  };
  const value = (text?: string) => text ? escapeHtml(text) : "No preference shared";
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: `She said yes — ${labels[params.activity] || "a date"} ✦`,
    html: `
      <div style="background:#fff7f5;padding:32px;font-family:Georgia,serif;color:#4b1e32">
        <div style="max-width:600px;margin:auto;background:#fff;padding:32px;border:1px solid #f0d1d5;border-radius:20px">
          <p style="margin:0;color:#b55368;font:700 11px Arial,sans-serif;letter-spacing:2px;text-transform:uppercase">Stacey&apos;s little hints</p>
          <h1 style="margin:14px 0 24px;font-size:32px;font-weight:400">You&apos;ve got a date to plan ♡</h1>
          <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px"><tbody>
            <tr><td style="padding:12px 0;border-top:1px solid #f1dfe1;color:#9a6573">Adventure</td><td style="padding:12px 0;border-top:1px solid #f1dfe1"><strong>${value(labels[params.activity])}</strong></td></tr>
            <tr><td style="padding:12px 0;border-top:1px solid #f1dfe1;color:#9a6573">Preferred date</td><td style="padding:12px 0;border-top:1px solid #f1dfe1"><strong>${value(params.preferredDate)}</strong></td></tr>
            <tr><td style="padding:12px 0;border-top:1px solid #f1dfe1;color:#9a6573">Best time</td><td style="padding:12px 0;border-top:1px solid #f1dfe1"><strong>${value(labels[params.timeOfDay])}</strong></td></tr>
          </tbody></table>
          <h2 style="margin:28px 0 6px;font-size:17px">Food or drink</h2><p style="margin:0;white-space:pre-wrap">${value(params.foodDrink)}</p>
          <h2 style="margin:22px 0 6px;font-size:17px">Movie taste</h2><p style="margin:0;white-space:pre-wrap">${value(params.movieTaste)}</p>
          <h2 style="margin:22px 0 6px;font-size:17px">Make it perfect</h2><p style="margin:0;white-space:pre-wrap">${value(params.perfectNote)}</p>
        </div>
      </div>`,
    tags: [{ name: "type", value: "stacey-response" }],
  });

  if (error) {
    console.error("[stacey] Failed to send response email:", error);
    return { success: false, error: error.message };
  }

  console.log(`[stacey] Response email sent (ID: ${data?.id})`);
  return { success: true };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
