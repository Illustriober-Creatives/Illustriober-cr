import type { Server as HttpServer } from "node:http";
import type { AdminTicketCreatedEvent, AdminTicketStatusChangedEvent, TicketComment } from "@illustriober/shared";
import { Server } from "socket.io";
import { verifyAccessToken } from "./jwt";
import { isAllowedOrigin } from "./origins";
import prisma from "./prisma";

type JoinTicketPayload = { ticketId: string };
type TicketRoomAck = (result: { ok: true } | { ok: false; error: string }) => void;

interface ClientToServerEvents {
  "ticket:join": (payload: JoinTicketPayload, acknowledge?: TicketRoomAck) => void;
  "ticket:leave": (payload: JoinTicketPayload) => void;
}

interface ServerToClientEvents {
  "ticket:comment-created": (comment: TicketComment) => void;
  "ticket:created": (ticket: AdminTicketCreatedEvent) => void;
  "ticket:status-changed": (ticket: AdminTicketStatusChangedEvent) => void;
}

interface InterServerEvents {}

interface SocketData {
  user: {
    id: string;
    role: string;
    email: string;
  };
}

export type RealtimeServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

let realtimeServer: RealtimeServer | null = null;

const ADMIN_ROOM = "admin:tickets";

function publicTicketRoom(ticketId: string): string {
  return `ticket:${ticketId}`;
}

function internalTicketRoom(ticketId: string): string {
  return `ticket:${ticketId}:internal`;
}

export function initializeRealtime(httpServer: HttpServer): RealtimeServer {
  const io: RealtimeServer = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || isAllowedOrigin(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Origin is not allowed"));
      },
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (typeof token !== "string" || !token) {
      next(new Error("Authentication required"));
      return;
    }

    try {
      const payload = verifyAccessToken(token);
      socket.data.user = {
        id: payload.sub,
        role: payload.role,
        email: payload.email,
      };
      next();
    } catch {
      next(new Error("Invalid or expired access token"));
    }
  });

  io.on("connection", (socket) => {
    if (socket.data.user.role === "ADMIN") {
      void socket.join(ADMIN_ROOM);
    }

    socket.on("ticket:join", async (payload, acknowledge) => {
      const ticketId = payload?.ticketId;
      if (typeof ticketId !== "string" || !ticketId || ticketId.length > 128) {
        acknowledge?.({ ok: false, error: "Invalid ticket" });
        return;
      }

      try {
        const ticket = await prisma.ticket.findUnique({
          where: { id: ticketId },
          select: { project: { select: { clientId: true } } },
        });

        const isAdmin = socket.data.user.role === "ADMIN";
        if (!ticket || (!isAdmin && ticket.project.clientId !== socket.data.user.id)) {
          acknowledge?.({ ok: false, error: "Access denied" });
          return;
        }

        await socket.join(publicTicketRoom(ticketId));
        if (isAdmin) {
          await socket.join(internalTicketRoom(ticketId));
        }
        acknowledge?.({ ok: true });
      } catch (error) {
        console.error("[realtime] failed to join ticket room", error);
        acknowledge?.({ ok: false, error: "Unable to join the discussion" });
      }
    });

    socket.on("ticket:leave", async ({ ticketId }) => {
      if (typeof ticketId !== "string" || !ticketId) return;
      await socket.leave(publicTicketRoom(ticketId));
      await socket.leave(internalTicketRoom(ticketId));
    });
  });

  realtimeServer = io;
  return io;
}

export function emitTicketComment(comment: TicketComment): void {
  if (!realtimeServer) return;

  const room = comment.isInternal
    ? internalTicketRoom(comment.ticketId)
    : publicTicketRoom(comment.ticketId);
  realtimeServer.to(room).to(ADMIN_ROOM).emit("ticket:comment-created", comment);
}

export function emitTicketCreated(event: AdminTicketCreatedEvent): void {
  if (!realtimeServer) return;
  realtimeServer.to(ADMIN_ROOM).emit("ticket:created", event);
}

export function emitTicketStatusChanged(event: AdminTicketStatusChangedEvent): void {
  if (!realtimeServer) return;
  realtimeServer.to(ADMIN_ROOM).emit("ticket:status-changed", event);
}
