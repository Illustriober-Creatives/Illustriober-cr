"use client";

import { useEffect, useRef, useState } from "react";
import type {
  AdminTicketCreatedEvent,
  AdminTicketStatusChangedEvent,
  TicketComment,
} from "@illustriober/shared";
import { createTicketSocket } from "@/lib/realtime";

export type AdminRealtimeConnectionState = "connecting" | "live" | "offline";

export interface UseAdminRealtimeHandlers {
  onTicketCreated?: (event: AdminTicketCreatedEvent) => void;
  onStatusChanged?: (event: AdminTicketStatusChangedEvent) => void;
  onComment?: (comment: TicketComment) => void;
}

export function useAdminRealtime(handlers: UseAdminRealtimeHandlers): {
  connectionState: AdminRealtimeConnectionState;
} {
  const [connectionState, setConnectionState] = useState<AdminRealtimeConnectionState>("connecting");
  const handlersRef = useRef(handlers);
  // eslint-disable-next-line react-hooks/refs
  handlersRef.current = handlers;

  useEffect(() => {
    const socket = createTicketSocket();

    socket.on("connect", () => setConnectionState("live"));
    socket.on("disconnect", () => setConnectionState("connecting"));
    socket.on("connect_error", () => setConnectionState("offline"));
    socket.on("ticket:created", (event) => handlersRef.current.onTicketCreated?.(event));
    socket.on("ticket:status-changed", (event) => handlersRef.current.onStatusChanged?.(event));
    socket.on("ticket:comment-created", (comment) => handlersRef.current.onComment?.(comment));
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  return { connectionState };
}
