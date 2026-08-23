import bcrypt from "bcryptjs";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { signAccessToken } from "../lib/jwt";

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  refreshToken: {
    updateMany: vi.fn(),
  },
  $transaction: vi.fn((callback: (client: unknown) => unknown) => callback(prismaMock)),
}));

vi.mock("../lib/prisma", () => ({
  default: prismaMock,
  prisma: prismaMock,
}));

import app from "../app";

const userFixture = {
  id: "user_123",
  email: "jane@example.com",
  firstName: "Jane",
  lastName: "Doe",
  phone: null as string | null,
  role: "CLIENT" as const,
  avatarUrl: null,
};

function bearer(userId = userFixture.id, role: "CLIENT" | "ADMIN" = "CLIENT") {
  const token = signAccessToken({ sub: userId, role, email: userFixture.email });
  return `Bearer ${token}`;
}

describe("users routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.refreshToken.updateMany.mockResolvedValue({ count: 0 });
  });

  describe("PATCH /api/users/me", () => {
    it("rejects unauthenticated requests", async () => {
      const response = await request(app)
        .patch("/api/users/me")
        .send({ firstName: "Jane", lastName: "Doe", phone: "" });

      expect(response.status).toBe(401);
    });

    it("updates firstName, lastName, and phone", async () => {
      prismaMock.user.update.mockResolvedValueOnce({
        ...userFixture,
        firstName: "Janet",
        phone: "555-0100",
      });

      const response = await request(app)
        .patch("/api/users/me")
        .set("Authorization", bearer())
        .send({ firstName: "Janet", lastName: "Doe", phone: "555-0100" });

      expect(response.status).toBe(200);
      expect(response.body.user.firstName).toBe("Janet");
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: userFixture.id },
        data: { firstName: "Janet", lastName: "Doe", phone: "555-0100" },
        select: expect.any(Object),
      });
    });

    it("clears phone to null when given an empty string", async () => {
      prismaMock.user.update.mockResolvedValueOnce({ ...userFixture, phone: null });

      await request(app)
        .patch("/api/users/me")
        .set("Authorization", bearer())
        .send({ firstName: "Jane", lastName: "Doe", phone: "" });

      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ phone: null }) })
      );
    });

    it("rejects an empty firstName", async () => {
      const response = await request(app)
        .patch("/api/users/me")
        .set("Authorization", bearer())
        .send({ firstName: "", lastName: "Doe", phone: "" });

      expect(response.status).toBe(400);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/users/me/password", () => {
    it("rejects unauthenticated requests", async () => {
      const response = await request(app)
        .post("/api/users/me/password")
        .send({ currentPassword: "old-pass-1", newPassword: "new-password-1" });

      expect(response.status).toBe(401);
    });

    it("rejects an incorrect current password", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        ...userFixture,
        passwordHash: await bcrypt.hash("correct-password", 12),
      });

      const response = await request(app)
        .post("/api/users/me/password")
        .set("Authorization", bearer())
        .send({ currentPassword: "wrong-password", newPassword: "new-password-1" });

      expect(response.status).toBe(401);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it("updates the password and revokes other sessions when current password is correct", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        ...userFixture,
        passwordHash: await bcrypt.hash("correct-password", 12),
      });
      prismaMock.user.update.mockResolvedValueOnce({ ...userFixture });

      const response = await request(app)
        .post("/api/users/me/password")
        .set("Authorization", bearer())
        .send({ currentPassword: "correct-password", newPassword: "new-password-1" });

      expect(response.status).toBe(200);
      expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.refreshToken.updateMany).toHaveBeenCalledTimes(1);
    });

    it("rejects a new password shorter than 8 characters", async () => {
      const response = await request(app)
        .post("/api/users/me/password")
        .set("Authorization", bearer())
        .send({ currentPassword: "correct-password", newPassword: "short" });

      expect(response.status).toBe(400);
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    });
  });
});
