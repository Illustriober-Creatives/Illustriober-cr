import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { signAccessToken } from "../lib/jwt";
import { resetRateLimitStore } from "../middleware/rateLimit";

const prismaMock = vi.hoisted(() => ({
  project: { findUnique: vi.fn() },
  ticket: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
}));

vi.mock("../lib/prisma", () => ({ default: prismaMock, prisma: prismaMock }));

import app from "../app";

const accessToken = signAccessToken({
  sub: "client_1",
  role: "CLIENT",
  email: "client@example.com",
});

describe("project ticket rate limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimitStore();
    prismaMock.project.findUnique.mockResolvedValue({ id: "project_1", clientId: "client_1" });
    prismaMock.ticket.findMany.mockResolvedValue([]);
  });

  it("blocks repeated authenticated requests after the project-ticket limit", async () => {
    for (let i = 0; i < 60; i++) {
      const response = await request(app)
        .get("/api/projects/demo/tickets")
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(200);
    }

    const response = await request(app)
      .get("/api/projects/demo/tickets")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(429);
    expect(response.headers["retry-after"]).toBeDefined();
  });
});
