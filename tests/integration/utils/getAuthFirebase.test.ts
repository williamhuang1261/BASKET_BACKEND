import config from "config";
import getAuthFirebase from "../../../src/utils/users/getAuthFirebase";
import initFirebase from "../../../src/startup/initFirebase";

// Testing getAuthFirebase, only verifies if the token is valid
describe("getAuthFirebase", () => {
  beforeAll(() => {
    initFirebase();
  });
  let token: string = config.get("user_jwt_id");
  const exec = async () => {
    return await getAuthFirebase(token);
  };
  it("Should not return null if token is valid", async () => {
    const result = await exec();
    expect(result).not.toBeNull();
  });
  it("Should return null if the token is invalid", async () => {
    token = "invalid-token";
    const res = await exec();
    expect(res).toBeNull();
  });
  it("Should fail gracefully if the server was unable to connect with firebase", async () => {

  });
});
