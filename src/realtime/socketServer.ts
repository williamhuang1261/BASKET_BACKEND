/**
 * @fileoverview Socket.IO relay for basket collaboration: presence counts
 * and item-change broadcasts scoped to a room per basket session id.
 * @module realtime/socketServer
 */

import { Server as HttpServer } from "http";
import { Server as HttpsServer } from "https";
import { Server as SocketIOServer, Socket } from "socket.io";

/** Payload a client sends to join a shared basket session */
interface JoinBasketPayload {
  basketId: string;
}

/** Payload relayed when a client changes an item's local state */
interface ItemChangedPayload {
  basketId: string;
  itemId: string;
  action: unknown;
}

const roomName = (basketId: string) => `basket:${basketId}`;

/**
 * @description Creates and wires a Socket.IO server onto an existing HTTP(S) server
 * @summary No persistence: room membership and presence counts live only in
 * Socket.IO's own in-memory adapter, matching the PRD's stated scope
 * @param {HttpServer | HttpsServer} server - the Node server to attach to
 * @returns {SocketIOServer} the created Socket.IO server instance
 */
const createSocketServer = (server: HttpServer | HttpsServer): SocketIOServer => {
  const io = new SocketIOServer(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket: Socket) => {
    let joinedBasketId: string | undefined;

    socket.on("join-basket", ({ basketId }: JoinBasketPayload) => {
      if (!basketId) return;
      joinedBasketId = basketId;
      socket.join(roomName(basketId));
      broadcastPresence(io, basketId);
    });

    socket.on("item-changed", ({ basketId, itemId, action }: ItemChangedPayload) => {
      if (!basketId || !itemId) return;
      socket.to(roomName(basketId)).emit("item-changed", { itemId, action });
    });

    socket.on("disconnect", () => {
      if (joinedBasketId) {
        // The socket has already left its rooms by the time "disconnect"
        // fires, so the room's remaining size already reflects this client
        // being gone.
        broadcastPresence(io, joinedBasketId);
      }
    });
  });

  return io;
};

/**
 * @description Broadcasts the current number of connected sockets in a basket's room
 * @param {SocketIOServer} io - the Socket.IO server
 * @param {string} basketId - the basket session id whose room presence changed
 */
const broadcastPresence = (io: SocketIOServer, basketId: string) => {
  const room = io.sockets.adapter.rooms.get(roomName(basketId));
  const count = room?.size ?? 0;
  io.to(roomName(basketId)).emit("presence", { count });
};

export { createSocketServer };
export type { JoinBasketPayload, ItemChangedPayload };
