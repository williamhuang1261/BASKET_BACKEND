import { DecodedIdToken } from "firebase-admin/auth";
import createNewUser from "../../../src/utils/users/createNewUser";
import User from "../../../src/models/users";
import mockIdToken from "../../mockData/mockIdToken";

let token: DecodedIdToken;

describe("createNewUser", () => {
  beforeAll(async () => {
    const moduleServer = await import("../../../src/index");
    const server = moduleServer.default;
    await server.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    token = mockIdToken;
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
    jest.spyOn(User.prototype, "save").mockImplementationOnce(() => {
      throw new Error("Database error");
    });
    const res = await exec();
    expect(res).toBeNull();
  });
});
