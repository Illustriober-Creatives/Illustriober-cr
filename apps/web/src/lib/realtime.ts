import type {
  AdminTicketCreatedEvent,
  AdminTicketStatusChangedEvent,
  TicketComment,
} from "@illustriober/shared";
import { io, type Socket } from "socket.io-client";
import { readBrowserAccessToken } from "@/contexts/AuthContext";

type TicketRoomAck = (result: { ok: true } | { ok: false; error: string }) => void;

interface ServerToClientEvents {
  "ticket:comment-created": (comment: TicketComment) => void;
  "ticket:created": (ticket: AdminTicketCreatedEvent) => void;
  "ticket:status-changed": (ticket: AdminTicketStatusChangedEvent) => void;
}

interface ClientToServerEvents {
  "ticket:join": (payload: { ticketId: string }, acknowledge?: TicketRoomAck) => void;
  "ticket:leave": (payload: { ticketId: string }) => void;
}

export type TicketSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

function getRealtimeUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_SOCKET_URL?.replace(/\/$/, "");
  if (configuredUrl) return configuredUrl;

  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return "https://api.illustriober.com";
  }

  return "http://localhost:4000";
}

export function createTicketSocket(): TicketSocket {
  return io(getRealtimeUrl(), {
    autoConnect: false,
    transports: ["websocket"],
    withCredentials: true,
    auth: (callback) => {
      callback({ token: readBrowserAccessToken() });
    },
  });
}
