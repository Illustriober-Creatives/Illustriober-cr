import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { signAccessToken } from "../lib/jwt";

const prismaMock = vi.hoisted(() => ({
  project: { findMany: vi.fn(), findUnique: vi.fn() },
  ticket: { findMany: vi.fn() },
  refreshToken: { updateMany: vi.fn(), create: vi.fn(), findUnique: vi.fn() },
}));

vi.mock("../lib/prisma", () => ({ default: prismaMock, prisma: prismaMock }));

import app from "../app";

function clientToken(id = "client_1") {
  return signAccessToken({ sub: id, role: "CLIENT", email: "c@c.com" });
}
function adminToken() {
  return signAccessToken({ sub: "admin_1", role: "ADMIN", email: "admin@example.com" });
}

const projectFixture = {
  id: "proj_1",
  name: "My Project",
  slug: "my-project",
  status: "ACTIVE",
  clientId: "client_1",
  createdAt: new Date(),
  updatedAt: new Date(),
  milestones: [],
  tickets: [],
};

describe("project routes — data isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.refreshToken.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.refreshToken.create.mockResolvedValue({ id: "r1" });
  });

  describe("GET /api/projects — list", () => {
    it("returns only the client's own projects", async () => {
      prismaMock.project.findMany.mockResolvedValue([projectFixture]);

      const res = await request(app)
        .get("/api/projects")
        .set("Authorization", `Bearer ${clientToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { clientId: "client_1" } })
      );
    });

    it("returns all projects for admin", async () => {
      prismaMock.project.findMany.mockResolvedValue([projectFixture]);

      const res = await request(app)
        .get("/api/projects")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(prismaMock.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} })
      );
    });

    it("returns 401 for unauthenticated requests", async () => {
      const res = await request(app).get("/api/projects");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/projects/:slug — detail", () => {
    it("allows the owning client to view their project", async () => {
      prismaMock.project.findUnique.mockResolvedValue(projectFixture);

      const res = await request(app)
        .get("/api/projects/my-project")
        .set("Authorization", `Bearer ${clientToken("client_1")}`);

      expect(res.status).toBe(200);
      expect(res.body.project.slug).toBe("my-project");
    });

    it("blocks a different client from viewing another client's project", async () => {
      prismaMock.project.findUnique.mockResolvedValue(projectFixture);

      const res = await request(app)
        .get("/api/projects/my-project")
        .set("Authorization", `Bearer ${clientToken("client_other")}`);

      expect(res.status).toBe(403);
    });

    it("allows admin to view any project", async () => {
      prismaMock.project.findUnique.mockResolvedValue(projectFixture);

      const res = await request(app)
        .get("/api/projects/my-project")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
    });

    it("returns 404 for unknown project", async () => {
      prismaMock.project.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get("/api/projects/does-not-exist")
        .set("Authorization", `Bearer ${clientToken()}`);

      expect(res.status).toBe(404);
    });
  });
});
