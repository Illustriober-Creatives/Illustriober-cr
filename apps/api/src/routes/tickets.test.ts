import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { signAccessToken } from "../lib/jwt";

const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  project: { findUnique: vi.fn(), findMany: vi.fn() },
  ticket: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn() },
  refreshToken: { updateMany: vi.fn(), create: vi.fn(), findUnique: vi.fn() },
}));

vi.mock("../lib/prisma", () => ({ default: prismaMock, prisma: prismaMock }));

import app from "../app";

function adminToken() {
  return signAccessToken({ sub: "admin_1", role: "ADMIN", email: "admin@example.com" });
}
function clientToken(id = "client_1") {
  return signAccessToken({ sub: id, role: "CLIENT", email: `${id}@example.com` });
}

describe("ticket routes isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.refreshToken.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.refreshToken.create.mockResolvedValue({ id: "r1" });
  });

  describe("GET /api/tickets", () => {
    it("filters tickets by client ID for non-admins", async () => {
      prismaMock.ticket.findMany.mockResolvedValue([]);

      await request(app)
        .get("/api/tickets")
        .set("Authorization", `Bearer ${clientToken("c123")}`);

      expect(prismaMock.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            project: { clientId: "c123" }
          })
        })
      );
    });

    it("does not filter by client ID for admins", async () => {
      prismaMock.ticket.findMany.mockResolvedValue([]);

      await request(app)
        .get("/api/tickets")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(prismaMock.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {}
        })
      );
    });

    it("returns no pagination field when no page/limit are given", async () => {
      prismaMock.ticket.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get("/api/tickets")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.body.pagination).toBeUndefined();
      expect(prismaMock.ticket.count).not.toHaveBeenCalled();
    });

    it("applies status and priority filters", async () => {
      prismaMock.ticket.findMany.mockResolvedValue([]);

      await request(app)
        .get("/api/tickets?status=IN_PROGRESS&priority=HIGH")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(prismaMock.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: "IN_PROGRESS", priority: "HIGH" }),
        })
      );
    });

    it("applies a search filter across title, project name, and client name", async () => {
      prismaMock.ticket.findMany.mockResolvedValue([]);

      await request(app)
        .get("/api/tickets?search=login")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(prismaMock.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: "login", mode: "insensitive" } },
              { project: { name: { contains: "login", mode: "insensitive" } } },
              { submittedBy: { firstName: { contains: "login", mode: "insensitive" } } },
              { submittedBy: { lastName: { contains: "login", mode: "insensitive" } } },
            ],
          }),
        })
      );
    });

    it("paginates and returns pagination metadata when page/limit are given", async () => {
      prismaMock.ticket.findMany.mockResolvedValue([{ id: "t1" }]);
      prismaMock.ticket.count.mockResolvedValue(45);

      const res = await request(app)
        .get("/api/tickets?page=2&limit=20")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(prismaMock.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 20 })
      );
      expect(res.body.pagination).toEqual({ page: 2, limit: 20, total: 45, totalPages: 3 });
    });
  });

  describe("POST /api/tickets", () => {
    it("allows client to create ticket for their own project", async () => {
      prismaMock.project.findUnique.mockResolvedValue({ id: "p1", clientId: "c123" });
      prismaMock.ticket.create.mockResolvedValue({ id: "t1" });

      const res = await request(app)
        .post("/api/tickets")
        .set("Authorization", `Bearer ${clientToken("c123")}`)
        .send({
          title: "Bug",
          description: "Something broke big time",
          type: "BUG",
          projectId: "p1"
        });

      expect(res.status).toBe(201);
    });

    it("prevents client from creating ticket for someone else's project", async () => {
      prismaMock.project.findUnique.mockResolvedValue({ id: "p1", clientId: "other_client" });

      const res = await request(app)
        .post("/api/tickets")
        .set("Authorization", `Bearer ${clientToken("c123")}`)
        .send({
          title: "Bug",
          description: "Something broke big time",
          type: "BUG",
          projectId: "p1"
        });

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/tickets/:id", () => {
    it("allows client to view their own ticket", async () => {
      prismaMock.ticket.findUnique.mockResolvedValue({
        id: "t1",
        project: { clientId: "c123" },
        comments: []
      });

      const res = await request(app)
        .get("/api/tickets/t1")
        .set("Authorization", `Bearer ${clientToken("c123")}`);

      expect(res.status).toBe(200);
    });

    it("prevents client from viewing someone else's ticket", async () => {
      prismaMock.ticket.findUnique.mockResolvedValue({
        id: "t1",
        project: { clientId: "other_client" },
        comments: []
      });

      const res = await request(app)
        .get("/api/tickets/t1")
        .set("Authorization", `Bearer ${clientToken("c123")}`);

      expect(res.status).toBe(403);
    });
  });
});
