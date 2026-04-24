import bcrypt from "bcryptjs";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { REFRESH_COOKIE_NAME } from "../lib/cookies";
import { signAccessToken } from "../lib/jwt";

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  refreshToken: {
    updateMany: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
  },
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
  role: "CLIENT" as const,
  avatarUrl: null,
  isActive: true,
};

describe("auth routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.refreshToken.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.refreshToken.create.mockResolvedValue({ id: "refresh_123" });
  });

  it("registers a user, returns an access token, and sets the refresh cookie", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.create.mockResolvedValueOnce({
      ...userFixture,
      passwordHash: "hashed",
    });

    const response = await request(app).post("/api/auth/register").send({
      email: userFixture.email,
      password: "super-secret-password",
      firstName: userFixture.firstName,
      lastName: userFixture.lastName,
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({
      email: userFixture.email,
      firstName: userFixture.firstName,
      lastName: userFixture.lastName,
      role: userFixture.role,
    });
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining(`${REFRESH_COOKIE_NAME}=`),
      ])
    );
  });

  it("logs in a user, updates lastLoginAt, and sets the refresh cookie", async () => {
    const password = "super-secret-password";
    const passwordHash = await bcrypt.hash(password, 4);

    prismaMock.user.findUnique.mockResolvedValueOnce({
      ...userFixture,
      passwordHash,
    });
    prismaMock.user.update.mockResolvedValueOnce({
      ...userFixture,
      lastLoginAt: new Date(),
    });

    const response = await request(app).post("/api/auth/login").send({
      email: userFixture.email,
      password,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: userFixture.id },
      data: { lastLoginAt: expect.any(Date) },
    });
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining(`${REFRESH_COOKIE_NAME}=`),
      ])
    );
  });

  it("returns the authenticated user for /me when given a valid bearer token", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: userFixture.id,
      email: userFixture.email,
      firstName: userFixture.firstName,
      lastName: userFixture.lastName,
      role: userFixture.role,
      avatarUrl: null,
    });

    const token = signAccessToken({
      sub: userFixture.id,
      role: userFixture.role,
      email: userFixture.email,
    });

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user).toMatchObject({
      id: userFixture.id,
      email: userFixture.email,
    });
  });

  it("refreshes a session when a valid refresh cookie is present", async () => {
    prismaMock.refreshToken.findUnique.mockResolvedValueOnce({
      token: "refresh-token",
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: userFixture,
    });

    const response = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", `${REFRESH_COOKIE_NAME}=refresh-token`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({
      id: userFixture.id,
      email: userFixture.email,
    });
  });

  it("rejects refresh when the session cookie is missing", async () => {
    const response = await request(app).post("/api/auth/refresh");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Missing refresh session");
  });

  it("logs out by revoking the session and clearing the refresh cookie", async () => {
    const response = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", `${REFRESH_COOKIE_NAME}=refresh-token`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(prismaMock.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { token: "refresh-token", revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining(`${REFRESH_COOKIE_NAME}=;`),
      ])
    );
  });

  it("rejects refresh after logout revokes the session", async () => {
    prismaMock.refreshToken.updateMany.mockResolvedValueOnce({ count: 1 });
    prismaMock.refreshToken.findUnique.mockResolvedValueOnce({
      token: "refresh-token",
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
      user: userFixture,
    });

    await request(app)
      .post("/api/auth/logout")
      .set("Cookie", `${REFRESH_COOKIE_NAME}=refresh-token`);

    const refreshResponse = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", `${REFRESH_COOKIE_NAME}=refresh-token`);

    expect(refreshResponse.status).toBe(401);
    expect(refreshResponse.body.error).toBe("Invalid or expired session");
  });
});
