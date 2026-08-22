import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.hoisted(() => vi.fn());

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

import {
  sendEnquiryEmails,
  sendInviteEmail,
  sendPasswordResetEmail,
} from "./email";

describe("transactional email templates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "re_test";
    process.env.ENQUIRY_FROM_EMAIL = "Illustriober <hello@illustriober.com>";
    process.env.ENQUIRY_ADMIN_EMAIL = "studio@illustriober.com";
    sendMock.mockResolvedValue({ data: { id: "email_123" }, error: null });
  });

  afterEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.ENQUIRY_FROM_EMAIL;
    delete process.env.ENQUIRY_ADMIN_EMAIL;
  });

  it("renders branded client and admin enquiry emails with escaped content", async () => {
    const result = await sendEnquiryEmails({
      enquiryId: "enq_123",
      clientEmail: "ada@example.com",
      clientName: "Ada <Lovelace>",
      projectType: "Web & mobile",
      description: "Build <fast>\nand securely.",
    });

    expect(result.success).toBe(true);
    expect(sendMock).toHaveBeenCalledTimes(2);

    const clientMessage = sendMock.mock.calls[0][0];
    expect(clientMessage.text).toContain("Reference: enq_123");
    expect(clientMessage.html).toContain("#F4EFE5");
    expect(clientMessage.html).toContain("#1F4D3D");
    expect(clientMessage.html).toContain("#F39314");
    expect(clientMessage.html).toContain("Ada &lt;Lovelace&gt;");
    expect(clientMessage.html).toContain("Web &amp; mobile");

    const adminMessage = sendMock.mock.calls[1][0];
    expect(adminMessage.html).toContain("Build &lt;fast&gt;\nand securely.");
    expect(adminMessage.html).not.toContain("Build <fast>");
  });

  it("renders the portal invitation with a branded action", async () => {
    await sendInviteEmail({
      to: "client@example.com",
      inviteUrl: "https://illustriober.com/invite/token?from=email&mode=invite",
    });

    const message = sendMock.mock.calls[0][0];
    expect(message.text).toContain("Create your account: https://illustriober.com/invite/token");
    expect(message.html).toContain("Create your account");
    expect(message.html).toContain("from=email&amp;mode=invite");
  });

  it("renders the password reset with expiry guidance and a branded action", async () => {
    await sendPasswordResetEmail({
      to: "client@example.com",
      resetUrl: "https://illustriober.com/reset-password?token=secret",
    });

    const message = sendMock.mock.calls[0][0];
    expect(message.text).toContain("expires in 30 minutes");
    expect(message.html).toContain("Secure account recovery");
    expect(message.html).toContain("Reset your password");
    expect(message.html).toContain("token=secret");
  });
});
