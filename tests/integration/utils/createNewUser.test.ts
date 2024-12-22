import http from "http";
import https from 'https'
import { DecodedIdToken } from "firebase-admin/auth";
import createNewUser from "../../../src/utils/users/createNewUser";
import User from "../../../src/models/users";
import mockIdToken from "../../mockData/mockIdToken";
import { describe, it, beforeAll, beforeEach, expect, vi, afterAll } from "vitest";

let token: DecodedIdToken;
let server: http.Server | https.Server

describe("createNewUser", () => {
  beforeAll(async () => {
    const moduleServer = await import("../../../src/index");
    server = moduleServer.default;
    await server.close();
  });

  beforeEach(async () => {
    try {
      await User.deleteMany({});
      token = mockIdToken;
    } catch (e) {
      console.error("Couldn't delete users or couldn't create new user", e);
    }
  });
  afterAll(async () => {
    try {
      if (server) await server.close();
    } catch (e) {
      console.error("Couldn't close server", e);
    }
  });

  // All info are fake and only for testing purposes
  const exec = async () => {
    return await createNewUser(token);
  };
  it("Should not return null if the user is created successfully", async () => {
    const res = await exec();
    expect(res).not.toBeNull();
  });
  it('Should return null if the token is invalid', async () => {
    // @ts-expect-error
    token.uid = undefined;
    const res = await exec();
    expect(res).toBeNull();
  });
  it("Should handle database save errors gracefully", async () => {
    vi.spyOn(User.prototype, "save").mockImplementationOnce(() => {
      throw new Error("Database error");
    });
    const res = await exec();
    expect(res).toBeNull();
  });
});
