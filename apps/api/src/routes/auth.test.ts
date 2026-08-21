import bcrypt from "bcryptjs";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CSRF_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  createCsrfToken,
} from "../lib/cookies";
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

const REQUESTED_WITH_HEADER = ["X-Requested-With", "Illustriober-Web"] as const;

function csrfSession(refreshToken: string) {
  const csrfToken = createCsrfToken(refreshToken);
  return {
    cookie: `${REFRESH_COOKIE_NAME}=${refreshToken}; ${CSRF_COOKIE_NAME}=${csrfToken}`,
    csrfToken,
  };
}

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

    const response = await request(app)
      .post("/api/auth/register")
      .set(...REQUESTED_WITH_HEADER)
      .send({
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
        expect.stringContaining(`${CSRF_COOKIE_NAME}=`),
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

    const response = await request(app)
      .post("/api/auth/login")
      .set(...REQUESTED_WITH_HEADER)
      .send({
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
        expect.stringContaining(`${CSRF_COOKIE_NAME}=`),
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
    const session = csrfSession("refresh-token");
    prismaMock.refreshToken.findUnique.mockResolvedValueOnce({
      token: "refresh-token",
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: userFixture,
    });

    const response = await request(app)
      .post("/api/auth/refresh")
      .set(...REQUESTED_WITH_HEADER)
      .set("X-CSRF-Token", session.csrfToken)
      .set("Cookie", session.cookie);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({
      id: userFixture.id,
      email: userFixture.email,
    });
  });

  it("rejects refresh when the session cookie is missing", async () => {
    const response = await request(app)
      .post("/api/auth/refresh")
      .set(...REQUESTED_WITH_HEADER);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Missing refresh session");
  });

  it("logs out by revoking the session and clearing the refresh cookie", async () => {
    const session = csrfSession("refresh-token");
    const response = await request(app)
      .post("/api/auth/logout")
      .set(...REQUESTED_WITH_HEADER)
      .set("X-CSRF-Token", session.csrfToken)
      .set("Cookie", session.cookie);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(prismaMock.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { token: "refresh-token", revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining(`${REFRESH_COOKIE_NAME}=;`),
        expect.stringContaining(`${CSRF_COOKIE_NAME}=;`),
      ])
    );
  });

  it("rotates the refresh token on a successful refresh", async () => {
    const session = csrfSession("old-refresh-token");
    prismaMock.refreshToken.findUnique.mockResolvedValueOnce({
      token: "old-refresh-token",
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: userFixture,
    });

    const response = await request(app)
      .post("/api/auth/refresh")
      .set(...REQUESTED_WITH_HEADER)
      .set("X-CSRF-Token", session.csrfToken)
      .set("Cookie", session.cookie);

    expect(response.status).toBe(200);
    expect(prismaMock.refreshToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: userFixture.id, revokedAt: null }),
        data: { revokedAt: expect.any(Date) },
      })
    );
    expect(prismaMock.refreshToken.create).toHaveBeenCalled();
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([expect.stringContaining(`${REFRESH_COOKIE_NAME}=`)])
    );
  });

  it("revokes all user sessions when a replayed (stolen) token is detected", async () => {
    const session = csrfSession("stolen-old-token");
    prismaMock.refreshToken.findUnique.mockResolvedValueOnce({
      token: "stolen-old-token",
      revokedAt: new Date(Date.now() - 60_000),
      expiresAt: new Date(Date.now() + 60_000),
      user: userFixture,
    });

    const response = await request(app)
      .post("/api/auth/refresh")
      .set(...REQUESTED_WITH_HEADER)
      .set("X-CSRF-Token", session.csrfToken)
      .set("Cookie", session.cookie);

    expect(response.status).toBe(401);
    expect(prismaMock.refreshToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: userFixture.id }),
        data: { revokedAt: expect.any(Date) },
      })
    );
  });

  it("rejects refresh after logout revokes the session", async () => {
    const session = csrfSession("refresh-token");
    prismaMock.refreshToken.updateMany.mockResolvedValueOnce({ count: 1 });
    prismaMock.refreshToken.findUnique.mockResolvedValueOnce({
      token: "refresh-token",
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
      user: userFixture,
    });

    await request(app)
      .post("/api/auth/logout")
      .set(...REQUESTED_WITH_HEADER)
      .set("X-CSRF-Token", session.csrfToken)
      .set("Cookie", session.cookie);

    const refreshResponse = await request(app)
      .post("/api/auth/refresh")
      .set(...REQUESTED_WITH_HEADER)
      .set("X-CSRF-Token", session.csrfToken)
      .set("Cookie", session.cookie);

    expect(refreshResponse.status).toBe(401);
    expect(refreshResponse.body.error).toBe("Invalid or expired session");
  });

  it("rejects a cookie-authenticated mutation without a valid CSRF token", async () => {
    const session = csrfSession("refresh-token");
    const response = await request(app)
      .post("/api/auth/refresh")
      .set(...REQUESTED_WITH_HEADER)
      .set("Cookie", session.cookie);

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("Invalid CSRF token");
    expect(prismaMock.refreshToken.findUnique).not.toHaveBeenCalled();
  });

  it("upgrades a legacy refresh session that predates CSRF cookies", async () => {
    prismaMock.refreshToken.findUnique.mockResolvedValueOnce({
      token: "legacy-refresh-token",
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: userFixture,
    });

    const response = await request(app)
      .post("/api/auth/refresh")
      .set(...REQUESTED_WITH_HEADER)
      .set("Cookie", `${REFRESH_COOKIE_NAME}=legacy-refresh-token`);

    expect(response.status).toBe(200);
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([expect.stringContaining(`${CSRF_COOKIE_NAME}=`)])
    );
  });

  it("rejects auth mutations from an untrusted origin", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .set(...REQUESTED_WITH_HEADER)
      .set("Origin", "https://attacker.example")
      .send({ email: userFixture.email, password: "super-secret-password" });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("Request origin is not allowed");
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });
});
