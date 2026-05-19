import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetRateLimitStore } from "./rateLimit";

const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  refreshToken: { updateMany: vi.fn(), create: vi.fn(), findUnique: vi.fn() },
}));

vi.mock("../lib/prisma", () => ({ default: prismaMock, prisma: prismaMock }));

import app from "../app";

beforeEach(() => {
  vi.clearAllMocks();
  resetRateLimitStore();
  prismaMock.refreshToken.updateMany.mockResolvedValue({ count: 0 });
  prismaMock.refreshToken.create.mockResolvedValue({ id: "r1" });
});

describe("rate limiting — auth endpoints", () => {
  it("allows requests under the login limit through", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "a@b.com", password: "pass" });

    expect(res.status).not.toBe(429);
  });

  it("blocks login after exceeding the per-IP limit", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const body = { email: "a@b.com", password: "pass" };
    for (let i = 0; i < 10; i++) {
      await request(app).post("/api/auth/login").send(body);
    }
    const res = await request(app).post("/api/auth/login").send(body);

    expect(res.status).toBe(429);
    expect(res.body.error).toMatch(/too many requests/i);
  });

  it("blocks register after exceeding the per-IP limit", async () => {
    // Return existing user so bcrypt is never called — warmup requests fail fast at 409
    prismaMock.user.findUnique.mockResolvedValue({ id: "u1", email: "a@b.com" });

    const body = { email: "a@b.com", password: "P@ssword1!", firstName: "A", lastName: "B" };
    for (let i = 0; i < 10; i++) {
      await request(app).post("/api/auth/register").send(body);
    }
    const res = await request(app).post("/api/auth/register").send(body);

    expect(res.status).toBe(429);
  });

  it("includes Retry-After header on 429 response", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const body = { email: "a@b.com", password: "pass" };
    for (let i = 0; i < 10; i++) {
      await request(app).post("/api/auth/login").send(body);
    }
    const res = await request(app).post("/api/auth/login").send(body);

    expect(res.status).toBe(429);
    expect(res.headers["retry-after"]).toBeDefined();
  });
});
