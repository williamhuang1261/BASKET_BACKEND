import { Server } from "http";
import User from "../../../../src/models/users";
import mockUser from "../../../mockData/mockUser";
import config from "config";
import request from "supertest";
import https from "https";

describe("/users/oauth", () => {
  let server: Server | https.Server;
  let token: string;

  beforeAll(async () => {
    try {
      const moduleServer = await import("../../../../src/index");
      server = moduleServer.default;
      await server.close();
    } catch (e) {
      console.error("Couldn't start server");
      console.error(e);
    }
  });

  beforeEach(async () => {
    try {
      await User.deleteMany({});
      const user = new User(mockUser);
      await user.save();
    } catch (e){
      console.error("Couldn't delete users or couldn't create new user");
    }
    token = config.get("user_jwt_id");
  });

  afterAll(async () => {
    try {
      if (server) await server.close();
    } catch {
      console.error("Couldn't close server");
    }
  });

  const exec = async () => {
    return await request(server)
      .post("/users/oauth")
      .set("x-auth-token", token);
  };

  it("Should return 401 if token is not valid", async () => {
    token = "invalid_token";
    const res = await exec();
    expect(res.status).toBe(401);
  });
  it("Should return 401 if token is not provided", async () => {
    const res = await request(server).post("/users/oauth");
    expect(res.status).toBe(401);
  });
  it('Should return 200 and user info if token is valid', async () => {
    const res = await exec();
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message')
    expect(res.body).toHaveProperty('user')
  });
});
