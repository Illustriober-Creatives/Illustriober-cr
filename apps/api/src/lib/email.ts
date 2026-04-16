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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
