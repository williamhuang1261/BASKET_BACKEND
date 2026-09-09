import { createServer } from "http";
import type { AddressInfo } from "net";
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { io as ioClient, Socket as ClientSocket } from "socket.io-client";
import { createSocketServer } from "../../../src/realtime/socketServer";

/**
 * Runs against a real, in-process Socket.IO server on an ephemeral local
 * port - no Docker or external service needed, unlike this project's
 * OpenSearch/SQS integration tests.
 */
describe("basket collaboration Socket.IO relay", () => {
  let baseUrl: string;

  beforeAll(async () => {
    const httpServer = createServer();
    createSocketServer(httpServer);
    await new Promise<void>((resolve) => httpServer.listen(0, resolve));
    const { port } = httpServer.address() as AddressInfo;
    baseUrl = `http://localhost:${port}`;
  });

  const connect = (): Promise<ClientSocket> =>
    new Promise((resolve) => {
      const socket = ioClient(baseUrl, { transports: ["websocket"] });
      socket.on("connect", () => resolve(socket));
    });

  const waitFor = <T>(socket: ClientSocket, event: string): Promise<T> =>
    new Promise((resolve) => socket.once(event, resolve));

  it("reports a presence count of 2 once both clients join the same basket", async () => {
    const clientA = await connect();
    const clientB = await connect();

    const aPresence = waitFor<{ count: number }>(clientA, "presence");
    clientA.emit("join-basket", { basketId: "shared-1" });
    await aPresence;

    const bPresence = waitFor<{ count: number }>(clientB, "presence");
    clientB.emit("join-basket", { basketId: "shared-1" });
    const { count } = await bPresence;

    expect(count).toBe(2);

    clientA.disconnect();
    clientB.disconnect();
  });

  it("relays an item change to the other client in the room, never back to the sender", async () => {
    const clientA = await connect();
    const clientB = await connect();

    clientA.emit("join-basket", { basketId: "shared-2" });
    await waitFor(clientA, "presence");
    clientB.emit("join-basket", { basketId: "shared-2" });
    await waitFor(clientB, "presence");

    let senderReceivedItsOwnChange = false;
    clientA.on("item-changed", () => {
      senderReceivedItsOwnChange = true;
    });

    const received = waitFor<{ itemId: string; action: unknown }>(
      clientB,
      "item-changed",
    );
    clientA.emit("item-changed", {
      basketId: "shared-2",
      itemId: "item-42",
      action: { group: "CHANGE", type: "QUANTITY", quantity: 3 },
    });

    const payload = await received;
    expect(payload).toEqual({
      itemId: "item-42",
      action: { group: "CHANGE", type: "QUANTITY", quantity: 3 },
    });
    expect(senderReceivedItsOwnChange).toBe(false);

    clientA.disconnect();
    clientB.disconnect();
  });

  it("never relays an item change to a client in a different basket session", async () => {
    const clientA = await connect();
    const clientC = await connect();

    clientA.emit("join-basket", { basketId: "shared-3" });
    await waitFor(clientA, "presence");
    clientC.emit("join-basket", { basketId: "different-session" });
    await waitFor(clientC, "presence");

    let clientCReceivedAnything = false;
    clientC.on("item-changed", () => {
      clientCReceivedAnything = true;
    });

    clientA.emit("item-changed", {
      basketId: "shared-3",
      itemId: "item-1",
      action: { group: "CHANGE", type: "QUANTITY", quantity: 1 },
    });

    // No cross-room event to wait on directly, so a short delay confirms
    // silence rather than asserting on a race.
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(clientCReceivedAnything).toBe(false);

    clientA.disconnect();
    clientC.disconnect();
  });
});
