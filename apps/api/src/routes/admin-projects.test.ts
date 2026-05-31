import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { signAccessToken } from "../lib/jwt";

const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), findMany: vi.fn() },
  project: { create: vi.fn(), findMany: vi.fn() },
  refreshToken: { updateMany: vi.fn(), create: vi.fn(), findUnique: vi.fn() },
}));

vi.mock("../lib/prisma", () => ({ default: prismaMock, prisma: prismaMock }));

import app from "../app";

function adminToken() {
  return signAccessToken({ sub: "admin_1", role: "ADMIN", email: "admin@example.com" });
}
function clientToken() {
  return signAccessToken({ sub: "client_1", role: "CLIENT", email: "c@c.com" });
}

describe("admin projects and clients routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.refreshToken.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.refreshToken.create.mockResolvedValue({ id: "r1" });
  });

  describe("GET /api/admin/projects", () => {
    it("returns all projects with client info for admin", async () => {
      prismaMock.project.findMany.mockResolvedValue([
        {
          id: "p1", name: "Test", slug: "test", status: "PLANNING", createdAt: new Date(),
          client: { firstName: "Alice", lastName: "Client", email: "alice@example.com" },
        },
      ]);

      const res = await request(app)
        .get("/api/admin/projects")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.projects).toHaveLength(1);
      expect(res.body.projects[0].client.firstName).toBe("Alice");
    });

    it("returns 401 for unauthenticated requests", async () => {
      const res = await request(app).get("/api/admin/projects");
      expect(res.status).toBe(401);
    });

    it("returns 403 for client role", async () => {
      const res = await request(app)
        .get("/api/admin/projects")
        .set("Authorization", `Bearer ${clientToken()}`);
      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/admin/clients", () => {
    it("returns list of clients for admin", async () => {
      prismaMock.user.findMany.mockResolvedValue([
        { id: "c1", firstName: "Alice", lastName: "Client", email: "alice@example.com" }
      ]);

      const res = await request(app)
        .get("/api/admin/clients")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.clients).toHaveLength(1);
      expect(res.body.clients[0].firstName).toBe("Alice");
    });
  });

  describe("POST /api/admin/projects", () => {
    const validProject = {
      name: "Test Project",
      slug: "test-project",
      description: "A description that is at least ten characters long.",
      clientId: "c1",
      status: "PLANNING"
    };

    it("creates a new project when data is valid", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: "c1", role: "CLIENT" });
      prismaMock.project.create.mockResolvedValue({ id: "p1", ...validProject });

      const res = await request(app)
        .post("/api/admin/projects")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send(validProject);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.project.name).toBe("Test Project");
    });

    it("returns 404 if client does not exist", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/admin/projects")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send(validProject);

      expect(res.status).toBe(404);
      expect(res.body.error).toContain("Client not found");
    });

    it("returns 400 for invalid data", async () => {
      const res = await request(app)
        .post("/api/admin/projects")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ name: "S" }); // too short

      expect(res.status).toBe(400);
    });
  });
});
