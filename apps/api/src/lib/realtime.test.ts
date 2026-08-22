import { createServer, type Server as HttpServer } from "node:http";
import type { AddressInfo } from "node:net";
import type { TicketComment } from "@illustriober/shared";
import { io as createClient, type Socket as ClientSocket } from "socket.io-client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { signAccessToken } from "./jwt";

const prismaMock = vi.hoisted(() => ({
  ticket: { findUnique: vi.fn() },
}));

vi.mock("./prisma", () => ({ default: prismaMock, prisma: prismaMock }));

import { emitTicketComment, initializeRealtime, type RealtimeServer } from "./realtime";

let httpServer: HttpServer | null = null;
let ioServer: RealtimeServer | null = null;
const clients: ClientSocket[] = [];

function accessToken(id: string, role: "ADMIN" | "CLIENT") {
  return signAccessToken({ sub: id, role, email: `${id}@example.com` });
}

async function startServer() {
  httpServer = createServer();
  ioServer = initializeRealtime(httpServer);
  await new Promise<void>((resolve) => httpServer!.listen(0, "127.0.0.1", resolve));
  const { port } = httpServer.address() as AddressInfo;
  return `http://127.0.0.1:${port}`;
}

async function connect(url: string, token: string) {
  const client = createClient(url, {
    auth: { token },
    transports: ["websocket"],
    forceNew: true,
  });
  clients.push(client);
  await new Promise<void>((resolve, reject) => {
    client.once("connect", resolve);
    client.once("connect_error", reject);
  });
  return client;
}

async function joinTicket(client: ClientSocket, ticketId: string) {
  return new Promise<{ ok: boolean; error?: string }>((resolve) => {
    client.emit("ticket:join", { ticketId }, resolve);
  });
}

const internalComment: TicketComment = {
  id: "comment_1",
  content: "Internal handoff note",
  ticketId: "ticket_1",
  authorId: "admin_1",
  isInternal: true,
  createdAt: "2026-08-22T10:00:00.000Z",
  editedAt: null,
  author: {
    id: "admin_1",
    firstName: "Studio",
    lastName: "Admin",
    role: "ADMIN",
  },
};

describe("ticket realtime rooms", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    for (const client of clients.splice(0)) client.disconnect();
    await new Promise<void>((resolve) => {
      if (!ioServer) {
        resolve();
        return;
      }
      ioServer.close(() => resolve());
    });
    ioServer = null;
    httpServer = null;
  });

  it("rejects a client joining another client's ticket", async () => {
    prismaMock.ticket.findUnique.mockResolvedValue({
      project: { clientId: "client_2" },
    });
    const url = await startServer();
    const client = await connect(url, accessToken("client_1", "CLIENT"));

    await expect(joinTicket(client, "ticket_1")).resolves.toEqual({
      ok: false,
      error: "Access denied",
    });
  });

  it("delivers internal notes to admins but never to clients", async () => {
    prismaMock.ticket.findUnique.mockResolvedValue({
      project: { clientId: "client_1" },
    });
    const url = await startServer();
    const client = await connect(url, accessToken("client_1", "CLIENT"));
    const admin = await connect(url, accessToken("admin_1", "ADMIN"));

    await expect(joinTicket(client, "ticket_1")).resolves.toEqual({ ok: true });
    await expect(joinTicket(admin, "ticket_1")).resolves.toEqual({ ok: true });

    const adminReceived = new Promise<TicketComment>((resolve) => {
      admin.once("ticket:comment-created", resolve);
    });
    const clientReceived = vi.fn();
    client.once("ticket:comment-created", clientReceived);

    emitTicketComment(internalComment);

    await expect(adminReceived).resolves.toEqual(internalComment);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(clientReceived).not.toHaveBeenCalled();
  });
});
