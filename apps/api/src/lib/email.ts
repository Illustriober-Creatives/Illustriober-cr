/**
 * Transactional email via Resend (optional — skipped when not configured)
 */

import { Resend } from "resend";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return null;
  }
  return new Resend(key);
}

export async function sendEnquiryEmails(params: {
  enquiryId: string;
  clientEmail: string;
  clientName: string;
  projectType: string;
  description: string;
}): Promise<void> {
  const resend = getResend();
  const from = process.env.ENQUIRY_FROM_EMAIL;
  const adminTo = process.env.ENQUIRY_ADMIN_EMAIL;

  if (!resend || !from) {
    console.warn(
      "[email] RESEND_API_KEY or ENQUIRY_FROM_EMAIL not set; skipping enquiry emails"
    );
    return;
  }

  const { enquiryId, clientEmail, clientName, projectType, description } = params;

  await resend.emails.send({
    from,
    to: clientEmail,
    subject: "We received your project enquiry — Illustriober Creatives",
    html: `
      <p>Hi ${escapeHtml(clientName)},</p>
      <p>Thanks for reaching out. We've received your enquiry about <strong>${escapeHtml(projectType)}</strong> and will review it shortly.</p>
      <p><strong>Reference:</strong> ${escapeHtml(enquiryId)}</p>
      <p>— Illustriober Creatives</p>
    `,
  });

  if (adminTo) {
    await resend.emails.send({
      from,
      to: adminTo,
      subject: `[Enquiry] ${clientName} — ${projectType}`,
      html: `
        <p><strong>New enquiry</strong></p>
        <ul>
          <li><strong>ID:</strong> ${escapeHtml(enquiryId)}</li>
          <li><strong>Name:</strong> ${escapeHtml(clientName)}</li>
          <li><strong>Email:</strong> ${escapeHtml(clientEmail)}</li>
          <li><strong>Project type:</strong> ${escapeHtml(projectType)}</li>
        </ul>
        <p><strong>Message:</strong></p>
        <pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(description)}</pre>
      `,
    });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
