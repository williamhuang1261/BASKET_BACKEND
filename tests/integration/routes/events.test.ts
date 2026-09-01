import { Server } from "http";
import https from "https";
import request from "supertest";
import ExperimentEvent from "../../../src/models/experimentEvent";
import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";

describe("/events", () => {
  let server: Server | https.Server;

  beforeAll(async () => {
    try {
      const moduleServer = await import("../../../src/index");
      server = moduleServer.default;
      await server.close();
    } catch (e) {
      console.error("Couldn't start server");
      console.error(e);
    }
  });

  afterAll(async () => {
    try {
      if (server) await server.close();
    } catch {
      console.error("Couldn't close server");
    }
  });

  describe("POST /", () => {
    let body: any;

    beforeEach(async () => {
      try {
        await ExperimentEvent.deleteMany({});
      } catch (e) {
        console.error("Couldn't clear experiment events");
      }
      body = {
        experimentId: "savings-summary-framing",
        variant: "A",
        eventType: "exposure",
        sessionId: "integration-test-session",
      };
    });

    const exec = async () => {
      return await request(server).post("/events").send(body);
    };

    it("Should return 400 if variant is invalid", async () => {
      body.variant = "C";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("Should return 400 if eventType is invalid", async () => {
      body.eventType = "click";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("Should return 201 and persist a valid event", async () => {
      const res = await exec();
      expect(res.status).toBe(201);

      const events = await ExperimentEvent.find({});
      expect(events.length).toBe(1);
      expect(events[0].experimentId).toBe(body.experimentId);
      expect(events[0].variant).toBe(body.variant);
      expect(events[0].eventType).toBe(body.eventType);
      expect(events[0].sessionId).toBe(body.sessionId);
    });

    it("Should persist both an exposure and a conversion for the same session", async () => {
      await exec();
      body.eventType = "conversion";
      await exec();

      const events = await ExperimentEvent.find({}).sort({ eventType: 1 });
      expect(events.length).toBe(2);
      expect(events.map((e) => e.eventType).sort()).toEqual([
        "conversion",
        "exposure",
      ]);
    });
  });
});
