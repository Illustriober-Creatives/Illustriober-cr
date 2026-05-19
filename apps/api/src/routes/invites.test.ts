import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { signAccessToken } from "../lib/jwt";

const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), create: vi.fn() },
  inviteToken: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  refreshToken: { updateMany: vi.fn(), create: vi.fn(), findUnique: vi.fn() },
}));

vi.mock("../lib/prisma", () => ({ default: prismaMock, prisma: prismaMock }));
vi.mock("../lib/email", () => ({ sendInviteEmail: vi.fn().mockResolvedValue({ success: true }) }));

import app from "../app";

const adminFixture = { id: "admin_1", email: "admin@example.com", role: "ADMIN" as const };
const tokenFixture = {
  id: "tok_1",
  token: "abc123",
  email: "client@example.com",
  userId: null,
  usedAt: null,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  createdAt: new Date(),
};

function adminToken() {
  return signAccessToken({ sub: adminFixture.id, role: adminFixture.role, email: adminFixture.email });
}

describe("invite routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.refreshToken.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.refreshToken.create.mockResolvedValue({ id: "r1" });
  });

  describe("POST /api/invites — create invite (admin only)", () => {
    it("creates an invite token and returns it", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.inviteToken.create.mockResolvedValue(tokenFixture);

      const res = await request(app)
        .post("/api/invites")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ email: "client@example.com" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBe("abc123");
      expect(prismaMock.inviteToken.create).toHaveBeenCalledOnce();
    });

    it("rejects unauthenticated requests", async () => {
      const res = await request(app)
        .post("/api/invites")
        .send({ email: "client@example.com" });

      expect(res.status).toBe(401);
    });

    it("rejects non-admin requests", async () => {
      const clientToken = signAccessToken({ sub: "u2", role: "CLIENT", email: "c@c.com" });

      const res = await request(app)
        .post("/api/invites")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ email: "client@example.com" });

      expect(res.status).toBe(403);
    });

    it("returns 409 if the email already has an account", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: "u3", email: "client@example.com" });

      const res = await request(app)
        .post("/api/invites")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ email: "client@example.com" });

      expect(res.status).toBe(409);
    });
  });

  describe("GET /api/invites/:token — validate invite", () => {
    it("returns email for a valid unused token", async () => {
      prismaMock.inviteToken.findUnique.mockResolvedValue(tokenFixture);

      const res = await request(app).get("/api/invites/abc123");

      expect(res.status).toBe(200);
      expect(res.body.email).toBe("client@example.com");
      expect(res.body.valid).toBe(true);
    });

    it("returns 404 for an unknown token", async () => {
      prismaMock.inviteToken.findUnique.mockResolvedValue(null);

      const res = await request(app).get("/api/invites/bad-token");

      expect(res.status).toBe(404);
    });

    it("returns 410 for an expired token", async () => {
      prismaMock.inviteToken.findUnique.mockResolvedValue({
        ...tokenFixture,
        expiresAt: new Date(Date.now() - 1000),
      });

      const res = await request(app).get("/api/invites/abc123");

      expect(res.status).toBe(410);
    });

    it("returns 410 for an already-used token", async () => {
      prismaMock.inviteToken.findUnique.mockResolvedValue({
        ...tokenFixture,
        usedAt: new Date(),
      });

      const res = await request(app).get("/api/invites/abc123");

      expect(res.status).toBe(410);
    });
  });

  describe("POST /api/invites/:token/accept — activate account", () => {
    it("creates a user account and returns an access token", async () => {
      prismaMock.inviteToken.findUnique.mockResolvedValue(tokenFixture);
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: "new_user", email: "client@example.com",
        firstName: "Jane", lastName: "Doe", role: "CLIENT",
      });
      prismaMock.inviteToken.update.mockResolvedValue({ ...tokenFixture, usedAt: new Date() });

      const res = await request(app)
        .post("/api/invites/abc123/accept")
        .send({ firstName: "Jane", lastName: "Doe", password: "S3cur3P@ss!" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toEqual(expect.any(String));
      expect(prismaMock.user.create).toHaveBeenCalledOnce();
      expect(prismaMock.inviteToken.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ usedAt: expect.any(Date) }) })
      );
    });

    it("returns 410 for expired/used token on accept", async () => {
      prismaMock.inviteToken.findUnique.mockResolvedValue({
        ...tokenFixture,
        usedAt: new Date(),
      });

      const res = await request(app)
        .post("/api/invites/abc123/accept")
        .send({ firstName: "Jane", lastName: "Doe", password: "S3cur3P@ss!" });

      expect(res.status).toBe(410);
    });
  });
});
