import { Server } from "http";
import https from "https";
import express from "express";
import isLoggedIn from "../../../src/middleware/isLoggedIn";
import config from "config";
import request from "supertest";
import User from "../../../src/models/users";
import {describe, it, beforeAll, afterAll, expect, vi, afterEach} from 'vitest'
import mockIdToken from "../../mockData/mockIdToken";

describe("isLoggedIn", () => {
  // Initializing variables
  let server: https.Server | Server;
  let token: string = config.get("user_jwt_id");
  
  // Initializing temporary express app
  const tempApp = express();
  tempApp.post(
    "/tests/integration/middleware/isLoggedIn",
    isLoggedIn,
    (req, res) => {
      res.send("ok").status(200);
      return
    }
  );
  beforeAll(async () => {
    try {
      const moduleServer = await import("../../../src/index");
      server = moduleServer.default;
      await server.close();
    } catch (ex) {
      console.log(ex);
    }
    await User.deleteMany({});
  });
  afterAll(async () => {
    await server.close();
    await User.deleteMany({});
  });
  afterEach(() => {
    vi.resetAllMocks()
  })
  it("Should return 200 if token is valid", async () => {
    const res = await request(tempApp)
      .post("/tests/integration/middleware/isLoggedIn")
      .set("x-auth-token", token);
    expect(res.status).toBe(200);
  });
  it("Should return 401 if token is invalid", async () => {
    token = 'invalid_token'
    const res = await request(tempApp)
      .post("/tests/integration/middleware/isLoggedIn")
      .set("x-auth-token", "invalid_token");
    expect(res.status).toBe(401);
  });
  it("Should return 401 if token is not provided", async () => {
    const res = await request(tempApp).post(
      "/tests/integration/middleware/isLoggedIn"
    );
    expect(res.status).toBe(401);
  });
});
