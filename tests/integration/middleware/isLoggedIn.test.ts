import { Server } from "http";
import https from "https";
import express from "express";
import isLoggedIn from "../../../src/middleware/isLoggedIn";
import config from "config";
import request from "supertest";
import getAuthFirebase from "../../../src/utils/users/getAuthFirebase";
import User from "../../../src/models/users";
import mockIdToken from '../../mockData/mockIdToken'

// Initializing variables
let server: https.Server | Server;
const token: string = config.get("user_jwt_id");

// Initializing temporary express app
const tempApp = express();
tempApp.post(
  "/tests/integration/middleware/isLoggedIn",
  isLoggedIn,
  (req, res) => {
    res.send("ok").status(200);
  }
);

// Setting up mock
jest.mock("../../../src/utils/users/getAuthFirebase");

describe("isLoggedIn", () => {
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
  it("Should return 200 if token is valid", async () => {
    (getAuthFirebase as jest.Mock).mockReturnValue(mockIdToken);
    const res = await request(tempApp)
      .post("/tests/integration/middleware/isLoggedIn")
      .set("x-auth-token", token);
    expect(res.status).toBe(200);
  });
  it("Should return 401 if token is invalid", async () => {
    (getAuthFirebase as jest.Mock).mockReturnValue(null);
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
