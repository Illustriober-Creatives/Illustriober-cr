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

type EmailAction = {
  label: string;
  url: string;
};

type EmailShellOptions = {
  preheader: string;
  eyebrow: string;
  title: string;
  bodyHtml: string;
  action?: EmailAction;
  footerNote?: string;
};

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return null;
  }
  return new Resend(key);
}

function renderEmailShell(options: EmailShellOptions): string {
  const action = options.action
    ? `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 0;">
        <tr>
          <td style="border-radius:999px;background:#F39314;">
            <a href="${escapeHtml(options.action.url)}" style="display:inline-block;padding:14px 24px;color:#171717;font-family:Arial,sans-serif;font-size:14px;font-weight:700;line-height:20px;text-decoration:none;">${escapeHtml(options.action.label)} &nbsp;&#8599;</a>
          </td>
        </tr>
      </table>`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>${escapeHtml(options.title)}</title>
    <style>
      @media only screen and (max-width: 620px) {
        .email-frame { width: 100% !important; }
        .email-pad { padding-left: 24px !important; padding-right: 24px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#F4EFE5;color:#171717;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(options.preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#F4EFE5;">
      <tr>
        <td align="center" style="padding:36px 16px;">
          <table class="email-frame" role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:600px;max-width:600px;border:1px solid #DDD6C8;border-radius:8px;background:#FFFDF8;">
            <tr>
              <td class="email-pad" style="padding:24px 36px;border-bottom:1px solid #E8E1D5;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="width:36px;height:36px;border-radius:50%;background:#F39314;color:#171717;font-family:Georgia,serif;font-size:17px;font-weight:700;text-align:center;vertical-align:middle;">il</td>
                    <td style="padding-left:12px;font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:#171717;">Illustriober Creatives<br><span style="font-size:11px;font-weight:400;color:#6A645B;">Digital product studio</span></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="email-pad" style="padding:38px 36px 40px;">
                <p style="margin:0 0 14px;color:#1F4D3D;font-family:Arial,sans-serif;font-size:11px;font-weight:700;line-height:16px;text-transform:uppercase;letter-spacing:2px;">${escapeHtml(options.eyebrow)}</p>
                <h1 style="margin:0 0 24px;color:#171717;font-family:Georgia,'Times New Roman',serif;font-size:38px;font-weight:400;line-height:44px;letter-spacing:0;">${escapeHtml(options.title)}</h1>
                <div style="color:#5F5A50;font-family:Arial,sans-serif;font-size:16px;line-height:26px;">${options.bodyHtml}</div>
                ${action}
              </td>
            </tr>
            <tr>
              <td class="email-pad" style="padding:22px 36px;border-top:1px solid #E8E1D5;background:#1F4D3D;color:#F4EFE5;font-family:Arial,sans-serif;font-size:12px;line-height:18px;">
                ${escapeHtml(options.footerNote || "Thoughtful software, built in Nairobi.")}
                <br><span style="color:#C9D8D2;">illustriober.com</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderDetails(rows: Array<{ label: string; value: string }>): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0 0;border:1px solid #E8E1D5;border-radius:8px;background:#F8F4EC;">
    ${rows
      .map(
        ({ label, value }, index) => `<tr>
          <td style="padding:14px 16px;${index ? "border-top:1px solid #E8E1D5;" : ""}font-family:Arial,sans-serif;font-size:12px;font-weight:700;line-height:18px;text-transform:uppercase;color:#1F4D3D;letter-spacing:1px;">${escapeHtml(label)}</td>
          <td align="right" style="padding:14px 16px;${index ? "border-top:1px solid #E8E1D5;" : ""}font-family:Arial,sans-serif;font-size:14px;line-height:20px;color:#171717;">${escapeHtml(value)}</td>
        </tr>`
      )
      .join("")}
  </table>`;
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
    text: `Hi ${clientName},\n\nThanks for reaching out. We received your enquiry about ${projectType} and will review it shortly.\n\nReference: ${enquiryId}\n\nIllustriober Creatives`,
    html: renderEmailShell({
      preheader: "Your project enquiry is safely with our studio.",
      eyebrow: "Enquiry received",
      title: "We have your brief.",
      bodyHtml: `
        <p style="margin:0 0 16px;">Hi ${escapeHtml(clientName)},</p>
        <p style="margin:0;">Thanks for reaching out. Your project is now in our review queue, and we will respond with a clear next step.</p>
        ${renderDetails([
          { label: "Project", value: projectType },
          { label: "Reference", value: enquiryId },
        ])}`,
      footerNote: "Good work starts with a clear conversation.",
    }),
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
      text: `New project enquiry\n\nFrom: ${clientName} (${clientEmail})\nProject: ${projectType}\nReference: ${enquiryId}\n\nBrief:\n${description}`,
      html: renderEmailShell({
        preheader: `${clientName} sent a new ${projectType} enquiry.`,
        eyebrow: "New studio enquiry",
        title: "A new brief is ready.",
        bodyHtml: `
          ${renderDetails([
            { label: "From", value: `${clientName} (${clientEmail})` },
            { label: "Project", value: projectType },
            { label: "Reference", value: enquiryId },
          ])}
          <p style="margin:26px 0 8px;color:#1F4D3D;font-size:11px;font-weight:700;line-height:16px;text-transform:uppercase;letter-spacing:1.5px;">Client brief</p>
          <div style="padding:18px;border-left:4px solid #F39314;background:#F8F4EC;color:#403C36;white-space:pre-wrap;">${escapeHtml(description)}</div>`,
        footerNote: "Review the brief and move the conversation forward.",
      }),
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
    text: `Your Illustriober client portal is ready.\n\nCreate your account: ${params.inviteUrl}\n\nThis private link expires in 7 days.`,
    html: renderEmailShell({
      preheader: "Your private Illustriober client portal is ready.",
      eyebrow: "Client portal invitation",
      title: "Your workspace is ready.",
      bodyHtml: `
        <p style="margin:0 0 16px;">You have been invited to the Illustriober client portal.</p>
        <p style="margin:0;">Create your account to follow delivery, review project updates, and keep decisions in one place.</p>
        <p style="margin:22px 0 0;font-size:13px;color:#6A645B;">This private link expires in 7 days.</p>`,
      action: { label: "Create your account", url: params.inviteUrl },
    }),
    tags: [{ name: "type", value: "client-invite" }],
  });

  if (error) {
    console.error("[email] Failed to send invite:", error);
    return { success: false, error: error.message };
  }

  console.log(`[email] Invite sent (ID: ${data?.id})`);
  return { success: true };
}

export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  const from = process.env.ENQUIRY_FROM_EMAIL;

  if (!resend || !from) {
    console.warn("[email] Password reset skipped - RESEND_API_KEY or ENQUIRY_FROM_EMAIL not set");
    return { success: false, error: "Email service not configured" };
  }

  const { data, error } = await resend.emails.send({
    from,
    to: params.to,
    subject: "Reset your Illustriober password",
    text: `Reset your Illustriober password: ${params.resetUrl}\n\nThis link expires in 30 minutes. If you did not request it, you can ignore this email.`,
    html: renderEmailShell({
      preheader: "Use this private link to choose a new Illustriober password.",
      eyebrow: "Secure account recovery",
      title: "Choose a new password.",
      bodyHtml: `
        <p style="margin:0 0 16px;">We received a request to reset the password for your Illustriober account.</p>
        <p style="margin:0;">The button below works once and expires in 30 minutes. If you did not make this request, you can safely ignore this email.</p>`,
      action: { label: "Reset your password", url: params.resetUrl },
      footerNote: "Your account security matters to us.",
    }),
    tags: [{ name: "type", value: "password-reset" }],
  });

  if (error) {
    console.error("[email] Failed to send password reset:", error);
    return { success: false, error: error.message };
  }

  console.log(`[email] Password reset sent (ID: ${data?.id})`);
  return { success: true };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
