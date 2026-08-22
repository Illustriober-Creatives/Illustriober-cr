import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { signAccessToken } from "../lib/jwt";

const prismaMock = vi.hoisted(() => ({
  ticket: { findUnique: vi.fn() },
  comment: { create: vi.fn() },
  refreshToken: { updateMany: vi.fn(), create: vi.fn(), findUnique: vi.fn() },
}));

vi.mock("../lib/prisma", () => ({ default: prismaMock, prisma: prismaMock }));

import app from "../app";

function token(id: string, role: "ADMIN" | "CLIENT") {
  return signAccessToken({ sub: id, role, email: `${id}@example.com` });
}

function persistedComment(isInternal: boolean) {
  return {
    id: "comment_1",
    content: "The updated build is ready.",
    ticketId: "ticket_1",
    authorId: "client_1",
    isInternal,
    createdAt: new Date("2026-08-22T10:00:00.000Z"),
    updatedAt: new Date("2026-08-22T10:00:00.000Z"),
    editedAt: null,
    author: {
      id: "client_1",
      firstName: "Casey",
      lastName: "Client",
      role: "CLIENT",
    },
  };
}

describe("ticket comments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates and serializes a comment for the ticket owner", async () => {
    prismaMock.ticket.findUnique.mockResolvedValue({
      id: "ticket_1",
      project: { clientId: "client_1" },
    });
    prismaMock.comment.create.mockResolvedValue(persistedComment(false));

    const response = await request(app)
      .post("/api/tickets/ticket_1/comments")
      .set("Authorization", `Bearer ${token("client_1", "CLIENT")}`)
      .send({ content: "  The updated build is ready.  " });

    expect(response.status).toBe(201);
    expect(response.body.comment).toMatchObject({
      id: "comment_1",
      content: "The updated build is ready.",
      createdAt: "2026-08-22T10:00:00.000Z",
    });
    expect(prismaMock.comment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          content: "The updated build is ready.",
          isInternal: false,
        }),
      })
    );
  });

  it("never lets a client create an internal note", async () => {
    prismaMock.ticket.findUnique.mockResolvedValue({
      id: "ticket_1",
      project: { clientId: "client_1" },
    });
    prismaMock.comment.create.mockResolvedValue(persistedComment(false));

    await request(app)
      .post("/api/tickets/ticket_1/comments")
      .set("Authorization", `Bearer ${token("client_1", "CLIENT")}`)
      .send({ content: "Public reply", isInternal: true });

    expect(prismaMock.comment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isInternal: false }),
      })
    );
  });

  it("rejects comments on another client's ticket", async () => {
    prismaMock.ticket.findUnique.mockResolvedValue({
      id: "ticket_1",
      project: { clientId: "client_2" },
    });

    const response = await request(app)
      .post("/api/tickets/ticket_1/comments")
      .set("Authorization", `Bearer ${token("client_1", "CLIENT")}`)
      .send({ content: "This should not be posted" });

    expect(response.status).toBe(403);
    expect(prismaMock.comment.create).not.toHaveBeenCalled();
  });

  it("filters internal notes from the client ticket response", async () => {
    prismaMock.ticket.findUnique.mockResolvedValue({
      id: "ticket_1",
      project: { clientId: "client_1" },
      comments: [],
    });

    await request(app)
      .get("/api/tickets/ticket_1")
      .set("Authorization", `Bearer ${token("client_1", "CLIENT")}`);

    expect(prismaMock.ticket.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          comments: expect.objectContaining({ where: { isInternal: false } }),
        }),
      })
    );
  });
});
