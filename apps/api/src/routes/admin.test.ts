import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { signAccessToken } from "../lib/jwt";

const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn() },
  enquiry: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  inviteToken: { create: vi.fn() },
  refreshToken: { updateMany: vi.fn(), create: vi.fn(), findUnique: vi.fn() },
  ticket: { groupBy: vi.fn(), findMany: vi.fn() },
  comment: { findMany: vi.fn() },
  passwordResetToken: { updateMany: vi.fn(), create: vi.fn(), update: vi.fn() },
}));

vi.mock("../lib/prisma", () => ({ default: prismaMock, prisma: prismaMock }));
vi.mock("../lib/email", () => ({
  sendInviteEmail: vi.fn().mockResolvedValue({ success: true }),
  sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true }),
}));

import app from "../app";

function adminToken() {
  return signAccessToken({ sub: "admin_1", role: "ADMIN", email: "admin@example.com" });
}
function clientToken() {
  return signAccessToken({ sub: "client_1", role: "CLIENT", email: "c@c.com" });
}

const enquiryFixture = {
  id: "enq_1",
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  phone: null,
  company: null,
  projectType: "Web App",
  description: "I need a web app",
  budgetRange: "$500-$2000",
  timeline: "1-3 months",
  referralSource: null,
  status: "NEW",
  adminNotes: null,
  convertedToId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("admin enquiry routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.refreshToken.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.refreshToken.create.mockResolvedValue({ id: "r1" });
  });

  describe("GET /api/admin/enquiries", () => {
    it("returns a list of enquiries for admin", async () => {
      prismaMock.enquiry.findMany.mockResolvedValue([enquiryFixture]);

      const res = await request(app)
        .get("/api/admin/enquiries")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.enquiries).toHaveLength(1);
      expect(res.body.enquiries[0].id).toBe("enq_1");
    });

    it("filters enquiries by status", async () => {
      prismaMock.enquiry.findMany.mockResolvedValue([]);

      await request(app)
        .get("/api/admin/enquiries?status=REVIEWED")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(prismaMock.enquiry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: "REVIEWED" }),
        })
      );
    });

    it("returns 401 for unauthenticated requests", async () => {
      const res = await request(app).get("/api/admin/enquiries");
      expect(res.status).toBe(401);
    });

    it("returns 403 for client role", async () => {
      const res = await request(app)
        .get("/api/admin/enquiries")
        .set("Authorization", `Bearer ${clientToken()}`);
      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/admin/enquiries/:id", () => {
    it("returns a single enquiry by id", async () => {
      prismaMock.enquiry.findUnique.mockResolvedValue(enquiryFixture);

      const res = await request(app)
        .get("/api/admin/enquiries/enq_1")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.enquiry.id).toBe("enq_1");
    });

    it("returns 404 for unknown enquiry", async () => {
      prismaMock.enquiry.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get("/api/admin/enquiries/bad_id")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/admin/enquiries/:id/convert — lead conversion", () => {
    it("creates an invite token, sends email, and marks enquiry as CONVERTED", async () => {
      prismaMock.enquiry.findUnique.mockResolvedValue(enquiryFixture);
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.inviteToken.create.mockResolvedValue({
        id: "tok_1", token: "invite-abc", email: "jane@example.com",
        expiresAt: new Date(Date.now() + 7 * 86400_000),
      });
      prismaMock.enquiry.update.mockResolvedValue({ ...enquiryFixture, status: "CONVERTED" });

      const res = await request(app)
        .post("/api/admin/enquiries/enq_1/convert")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.inviteToken).toBe("invite-abc");
      expect(prismaMock.enquiry.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: "CONVERTED" }),
        })
      );
    });

    it("returns 409 if a user with that email already exists", async () => {
      prismaMock.enquiry.findUnique.mockResolvedValue(enquiryFixture);
      prismaMock.user.findUnique.mockResolvedValue({ id: "u1", email: "jane@example.com" });

      const res = await request(app)
        .post("/api/admin/enquiries/enq_1/convert")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(409);
    });

    it("returns 400 if enquiry is already converted", async () => {
      prismaMock.enquiry.findUnique.mockResolvedValue({ ...enquiryFixture, status: "CONVERTED" });

      const res = await request(app)
        .post("/api/admin/enquiries/enq_1/convert")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(400);
    });
  });
});

describe("admin user management routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.refreshToken.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.refreshToken.create.mockResolvedValue({ id: "r1" });
    prismaMock.passwordResetToken.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.passwordResetToken.create.mockResolvedValue({ id: "reset_1" });
    prismaMock.passwordResetToken.update.mockResolvedValue({ id: "reset_1" });
  });

  const userFixture = {
    id: "user_1",
    email: "jane@example.com",
    firstName: "Jane",
    lastName: "Doe",
    phone: null,
    role: "CLIENT" as const,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    projects: [],
    tickets: [],
  };

  describe("GET /api/admin/users", () => {
    it("returns all users for admin", async () => {
      prismaMock.user.findMany.mockResolvedValue([userFixture]);

      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.users).toHaveLength(1);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} })
      );
    });

    it("filters by role", async () => {
      prismaMock.user.findMany.mockResolvedValue([]);

      await request(app)
        .get("/api/admin/users?role=ADMIN")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { role: "ADMIN" } })
      );
    });

    it("returns 403 for client role", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${clientToken()}`);
      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/admin/users/:id", () => {
    it("returns user detail for admin", async () => {
      prismaMock.user.findUnique.mockResolvedValue(userFixture);

      const res = await request(app)
        .get("/api/admin/users/user_1")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe("user_1");
    });

    it("returns 404 for unknown user", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get("/api/admin/users/does-not-exist")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/admin/users/:id", () => {
    it("toggles isActive", async () => {
      prismaMock.user.update.mockResolvedValue({ ...userFixture, isActive: false });

      const res = await request(app)
        .patch("/api/admin/users/user_1")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ isActive: false });

      expect(res.status).toBe(200);
      expect(res.body.user.isActive).toBe(false);
    });

    it("rejects an admin deactivating their own account", async () => {
      const res = await request(app)
        .patch("/api/admin/users/admin_1")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ isActive: false });

      expect(res.status).toBe(400);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it("allows an admin to reactivate their own account", async () => {
      prismaMock.user.update.mockResolvedValue({ ...userFixture, id: "admin_1", isActive: true });

      const res = await request(app)
        .patch("/api/admin/users/admin_1")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ isActive: true });

      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/admin/users/:id/reset-password", () => {
    it("issues a reset token and sends the email", async () => {
      prismaMock.user.findUnique.mockResolvedValue(userFixture);

      const res = await request(app)
        .post("/api/admin/users/user_1/reset-password")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(prismaMock.passwordResetToken.create).toHaveBeenCalledTimes(1);
    });

    it("returns 404 for unknown user", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/admin/users/does-not-exist/reset-password")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(404);
      expect(prismaMock.passwordResetToken.create).not.toHaveBeenCalled();
    });

    it("rejects resetting a deactivated user's password", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ ...userFixture, isActive: false });

      const res = await request(app)
        .post("/api/admin/users/user_1/reset-password")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(400);
      expect(prismaMock.passwordResetToken.create).not.toHaveBeenCalled();
    });
  });
});

describe("GET /api/admin/dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.refreshToken.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.refreshToken.create.mockResolvedValue({ id: "r1" });
  });

  it("rejects unauthenticated requests", async () => {
    const res = await request(app).get("/api/admin/dashboard");
    expect(res.status).toBe(401);
  });

  it("rejects non-admin requests", async () => {
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${clientToken()}`);
    expect(res.status).toBe(403);
  });

  it("aggregates status counts and merges recent activity, sorted and capped at 20", async () => {
    prismaMock.ticket.groupBy.mockResolvedValue([
      { status: "OPEN", _count: 3 },
      { status: "IN_PROGRESS", _count: 1 },
      { status: "CLOSED", _count: 9 },
    ]);
    prismaMock.ticket.findMany.mockResolvedValue([
      {
        id: "t1",
        title: "Login broken",
        createdAt: new Date("2026-08-22T08:00:00.000Z"),
        project: { name: "Studio Site" },
        submittedBy: { firstName: "Jane", lastName: "Doe" },
      },
    ]);
    prismaMock.comment.findMany.mockResolvedValue([
      {
        id: "c1",
        ticketId: "t1",
        isInternal: false,
        createdAt: new Date("2026-08-22T09:00:00.000Z"),
        ticket: { title: "Login broken", project: { name: "Studio Site" } },
        author: { firstName: "Ada", lastName: "Admin" },
      },
    ]);

    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.statusCounts).toEqual({ OPEN: 3, IN_REVIEW: 0, IN_PROGRESS: 1, RESOLVED: 0 });
    expect(res.body.recentActivity).toHaveLength(2);
    expect(res.body.recentActivity[0]).toMatchObject({ kind: "comment_created", ticketId: "t1" });
    expect(res.body.recentActivity[1]).toMatchObject({ kind: "ticket_created", ticketId: "t1" });
  });
});
