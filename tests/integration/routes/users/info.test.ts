import http from "http";
import https from "https";
import User from "../../../../src/models/users";
import config from "config";
import request from "supertest";
import mongoose from "mongoose";
import mockUser from "../../../mockData/mockUser";
import categories from "../../../../src/data/data";

describe("/users/info", () => {
  const uid: string = config.get("uid");
  let token: string;
  let server: http.Server | https.Server;
  beforeAll(async () => {
    try {
      const moduleServer = await import("../../../../src/index");
      server = moduleServer.default;
      await server.close();
    } catch (e) {
      console.error("Couldn't start server", e);
    }
  });
  beforeEach(async () => {
    try {
      await User.deleteMany({});
    } catch (e) {
      console.error("Couldn't delete users or couldn't create new user", e);
    }
    token = config.get("user_jwt_id");
  });
  afterEach(async () => {
    jest.restoreAllMocks();
  });
  afterAll(async () => {
    try {
      if (server) await server.close();
    } catch (e) {
      console.error("Couldn't close server", e);
    }
  });

  describe("PUT /basic/me", () => {
    let values: any;
    beforeEach(() => {
      values = {
        name: "new_name",
        email: undefined,
      };
    });
    const exec = async () => {
      return await request(server)
        .put("/users/info/basic/me")
        .set("x-auth-token", token)
        .send(values);
    };
    it("Should return 200 if user is updated", async () => {
      const res = await exec();
      expect(res.status).toBe(200);

      const user = await User.findOne({ uid: uid });
      expect(user).toBeDefined();
      if (user) {
        expect(user.name).toBe(values.name);
        expect(user.email).toBe(values.email);
      }
    });
    it("Should return 200 - No values are required", async () => {
      values = {};
      const res = await exec();
      expect(res.status).toBe(200);
    });
    it("Should return 401 if token is not provided", async () => {
      const res = await request(server)
        .put("/users/info/basic/me")
        .send(values);
      expect(res.status).toBe(401);
    });
    it("Should return 401 if token is not valid", async () => {
      token = "invalid_token";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return 400 if key is not valid", async () => {
      values = {
        invalid_key: "invalid_value",
      };
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if value in not valid", async () => {
      values = {
        name: "new_name",
        email: "invalid_email",
      };
      let res = await exec();
      expect(res.status).toBe(400);

      values = {
        name: "a",
        email: "good_email@gmail.com",
      };
      res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 500 if an error occured during the update", async () => {
      jest.spyOn(User.prototype, "save").mockRejectedValue(new Error());
      const res = await exec();
      expect(res.status).toBe(500);
    });
  });

  describe("PUT /location/me", () => {
    let values: any;
    beforeEach(() => {
      values = {
        country: "Canada",
        type: "Point",
        coordinates: [0, 0],
        formattedAddress: "formatted address",
      };
    });
    const exec = async () => {
      return await request(server)
        .put("/users/info/location/me")
        .set("x-auth-token", token)
        .send(values);
    };
    it("Should return 200 if user is updated", async () => {
      const res = await exec();
      expect(res.status).toBe(200);

      const user = await User.findOne({ uid: uid });
      expect(user).toBeDefined();
      if (user) {
        expect(user.location.country).toBe(values.country);
        expect(user.location.type).toBe(values.type);
        expect(user.location.coordinates).toStrictEqual(values.coordinates);
        expect(user.location.formattedAddress).toBe(values.formattedAddress);
      }
    });
    it("Should return 401 if token is not provided", async () => {
      const res = await request(server)
        .put("/users/info/location/me")
        .send(values);
      expect(res.status).toBe(401);
    });
    it("Should return 401 if token is not valid", async () => {
      token = "invalid_token";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return 400 if key is not valid", async () => {
      values = {
        invalid_key: "invalid_value",
      };
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if value in not valid", async () => {
      values.formattedAddress = 0;
      let res = await exec();
      expect(res.status).toBe(400);
      values.formattedAddress = "formatted address";

      values.type = "invalid_type";
      res = await exec();
      expect(res.status).toBe(400);
      values.type = "Point";

      values.country = "invalid_country";
      res = await exec();
      expect(res.status).toBe(400);
      values.country = "Canada";

      values.coordinates = [0];
      res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 500 if an error occured during the update", async () => {
      jest.spyOn(User.prototype, "save").mockRejectedValue(new Error());
      const res = await exec();
      expect(res.status).toBe(500);
    });
  });

  describe("POST /membership/me", () => {
    let values: any;
    beforeEach(() => {
      values = {
        membership: [
          new mongoose.Types.ObjectId().toString(),
          new mongoose.Types.ObjectId().toString(),
        ],
      };
    });
    const exec = async () => {
      return await request(server)
        .post("/users/info/membership/me")
        .set("x-auth-token", token)
        .send(values);
    };
    it("Should return 200 if user is updated", async () => {
      const res = await exec();
      expect(res.status).toBe(200);

      const user = await User.findOne({ uid: uid });
      expect(user).toBeDefined();
      if (user) {
        expect(user.membership.size).toBe(2);
      }
    });
    it("Should return 401 if token is not provided", async () => {
      const res = await request(server)
        .post("/users/info/membership/me")
        .send(values);
      expect(res.status).toBe(401);
    });
    it("Should return 401 if token is not valid", async () => {
      token = "invalid_token";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return 400 if key is not valid", async () => {
      values = {
        invalid_key: "invalid_value",
      };
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if value in not valid", async () => {
      values.membership = "invalid_membership";
      let res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if array length is 0 or > 16", async () => {
      values.membership = [];
      let res = await exec();
      expect(res.status).toBe(400);

      values.membership = new Array(17).fill(
        new mongoose.Types.ObjectId().toString()
      );
      res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 500 if an error occured during the update", async () => {
      jest.spyOn(User.prototype, "save").mockRejectedValue(new Error());
      const res = await exec();
      expect(res.status).toBe(500);
    });
  });

  describe("DELETE /membership/me", () => {
    let values: any;
    beforeEach(async () => {
      values = {
        membership: [
          new mongoose.Types.ObjectId().toString(),
          new mongoose.Types.ObjectId().toString(),
        ],
      };
      const user = new User(mockUser);
      user.membership = new Map([
        [values.membership[0], true],
        [values.membership[1], true],
      ]);
      await user.save();
    });
    const exec = async () => {
      return await request(server)
        .delete("/users/info/membership/me")
        .set("x-auth-token", token)
        .send(values);
    };
    it("Should return 200 if user is updated", async () => {
      const res = await exec();
      expect(res.status).toBe(200);

      const user = await User.findOne({ uid: uid });
      expect(user).toBeDefined();
      if (user) {
        expect(user.membership.size).toBe(0);
      }
    });
    it("Should return 401 if token is not provided", async () => {
      const res = await request(server)
        .delete("/users/info/membership/me")
        .send(values);
      expect(res.status).toBe(401);
    });
    it("Should return 401 if token is not valid", async () => {
      token = "invalid_token";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return 400 if key is not valid", async () => {
      values = {
        invalid_key: "invalid_value",
      };
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if value in not valid", async () => {
      values.membership = "invalid_membership";
      let res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return if array length is 0 or > 16", async () => {
      values.membership = [];
      let res = await exec();
      expect(res.status).toBe(400);

      values.membership = new Array(17).fill(
        new mongoose.Types.ObjectId().toString()
      );
      res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 500 if an error occured during the update", async () => {
      jest.spyOn(User.prototype, "save").mockRejectedValue(new Error());
      const res = await exec();
      expect(res.status).toBe(500);
    });
  });

  describe("PUT /preferences/me", () => {
    let values: any;
    beforeEach(() => {
      values = {
        weightUnits: "kg",
        distUnits: "km",
        language: "en",
      };
    });
    const exec = async () => {
      return await request(server)
        .put("/users/info/preferences/me")
        .set("x-auth-token", token)
        .send(values);
    };
    it("Should return 200 if user is updated", async () => {
      const res = await exec();
      expect(res.status).toBe(200);

      const user = await User.findOne({ uid: uid });
      expect(user).toBeDefined();
      if (user) {
        expect(user.preferences.weightUnits).toBe(values.weightUnits);
        expect(user.preferences.distUnits).toBe(values.distUnits);
        expect(user.preferences.language).toBe(values.language);
      }
    });
    it("Should return 200 - No values are required", async () => {
      values = {};
      const res = await exec();
      expect(res.status).toBe(200);
    });
    it("Should return 401 if token is not provided", async () => {
      const res = await request(server)
        .put("/users/info/preferences/me")
        .send(values);
      expect(res.status).toBe(401);
    });
    it("Should return 401 if token is not valid", async () => {
      token = "invalid_token";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return 400 if key is not valid", async () => {
      values = {
        invalid_key: "invalid_value",
      };
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if value in not valid", async () => {
      values.weightUnits = "invalid_weightUnits";
      let res = await exec();
      expect(res.status).toBe(400);
      values.weightUnits = "kg";

      values.distUnits = "invalid_distUnits";
      res = await exec();
      expect(res.status).toBe(400);
      values.distUnits = "km";

      values.language = "invalid_language";
      res = await exec();
      expect(res.status).toBe(400);
      values.language = "en";
    });
    it("Should return 500 if an error occured during the update", async () => {
      jest.spyOn(User.prototype, "save").mockRejectedValue(new Error());
      const res = await exec();
      expect(res.status).toBe(500);
    });
  });

  describe("POST /items/me", () => {
    let values: any;
    beforeEach(async () => {
      const user = new User(mockUser);
      user.items = new Map([
        [
          new mongoose.Types.ObjectId().toString(),
          {
            method: "weight",
            units: "kg",
            quantity: 10,
          },
        ],
        [
          new mongoose.Types.ObjectId().toString(),
          {
            method: "unit",
            units: "unit",
            quantity: 5,
          },
        ],
      ]);
      await user.save();
      const keysArr = Array.from(user.items.keys());
      values = {
        items: [
          {
            id: keysArr[0],
            select: {
              method: "weight",
              units: "kg",
              quantity: 10,
            },
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            select: {
              method: "unit",
              units: "unit",
              quantity: 15,
            },
          },
        ],
      };
    });
    const exec = async () => {
      return await request(server)
        .post("/users/info/items/me")
        .set("x-auth-token", token)
        .send(values);
    };
    it("Should return 200 if user is updated", async () => {
      const res = await exec();
      expect(res.status).toBe(200);

      const user = await User.findOne({ uid: uid });
      expect(user).toBeDefined();
      if (user) {
        expect(user.items.size).toBe(3);
      }
    });
    it("Should return 400 when no items are provided", async () => {
      values = {};
      let res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 401 if token is not provided", async () => {
      const res = await request(server)
        .post("/users/info/items/me")
        .send(values);
      expect(res.status).toBe(401);
    });
    it("Should return 401 if token is not valie", async () => {
      token = "invalid_token";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return 400 if key is not valid", async () => {
      values = {
        invalid_key: "invalid_value",
      };
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if value in not valid", async () => {
      values.items = "invalid_items";
      let res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if array length is 0 or > 16", async () => {
      values.items = [];
      let res = await exec();
      expect(res.status).toBe(400);

      values.items = new Array(17).fill({
        id: new mongoose.Types.ObjectId().toString(),
        select: {
          method: "unit",
          units: "unit",
          quantity: 5,
        },
      });
      res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if max items per user is exceeded", async () => {
      values.membership = new Array(15).fill(
        new mongoose.Types.ObjectId().toString()
      );
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 500 if an error occured during the update", async () => {
      jest.spyOn(User.prototype, "save").mockRejectedValue(new Error());
      const res = await exec();
      expect(res.status).toBe(500);
    });
  });

  describe("PUT /items/me", () => {
    let values: any;
    beforeEach(async () => {
      const user = new User(mockUser);
      user.items = new Map([
        [
          new mongoose.Types.ObjectId().toString(),
          {
            method: "weight",
            units: "kg",
            quantity: 10,
          },
        ],
        [
          new mongoose.Types.ObjectId().toString(),
          {
            method: "unit",
            units: "unit",
            quantity: 5,
          },
        ],
      ]);
      await user.save();
      const keysArr = Array.from(user.items.keys());
      values = {
        items: [
          {
            id: keysArr[0],
            select: {
              method: "weight",
              units: "kg",
              quantity: 10,
            },
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            select: {
              method: "unit",
              units: "unit",
              quantity: 5,
            },
          },
        ],
      };
    });
    const exec = async () => {
      return await request(server)
        .put("/users/info/items/me")
        .set("x-auth-token", token)
        .send(values);
    };
    it("Should return 200 if user is updated", async () => {
      const res = await exec();
      expect(res.status).toBe(200);

      const user = await User.findOne({ uid: uid });
      expect(user).toBeDefined();
      if (user) {
        expect(user.items.size).toBe(2);
      }
    });
    it("Should return 400 when no items are provided", async () => {
      values = {};
      let res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 401 if token is not provided", async () => {
      const res = await request(server)
        .put("/users/info/items/me")
        .send(values);
      expect(res.status).toBe(401);
    });
    it("Should return 401 if token is not valid", async () => {
      token = "invalid_token";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return 400 if key is not valid", async () => {
      values = {
        invalid_key: "invalid_value",
      };
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if value in not valid", async () => {
      values.items = "invalid_items";
      let res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if array length is 0 or > 16", async () => {
      values.items = [];
      let res = await exec();
      expect(res.status).toBe(400);

      values.items = new Array(17).fill({
        id: new mongoose.Types.ObjectId().toString(),
        select: {
          method: "unit",
          units: "unit",
          quantity: 5,
        },
      });
      res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 500 if an error occured during the update", async () => {
      jest.spyOn(User.prototype, "save").mockRejectedValue(new Error());
      const res = await exec();
      expect(res.status).toBe(500);
    });
  });

  describe("DELETE /items/me", () => {
    let values: any;
    beforeEach(async () => {
      const user = new User(mockUser);
      user.items = new Map([
        [
          new mongoose.Types.ObjectId().toString(),
          {
            method: "weight",
            units: "kg",
            quantity: 10,
          },
        ],
        [
          new mongoose.Types.ObjectId().toString(),
          {
            method: "unit",
            units: "unit",
            quantity: 5,
          },
        ],
      ]);
      await user.save();
      const keysArr = Array.from(user.items.keys());
      values = {
        items: [keysArr[0], keysArr[1]],
      };
    });
    const exec = async () => {
      return await request(server)
        .delete("/users/info/items/me")
        .set("x-auth-token", token)
        .send(values);
    };
    it("Should return 200 if user is updated", async () => {
      const res = await exec();
      expect(res.status).toBe(200);

      const user = await User.findOne({ uid: uid });
      expect(user).toBeDefined();
      if (user) {
        expect(user.items.size).toBe(0);
      }
    });
    it("Should return 400 when no items are provided", async () => {
      values = {};
      let res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 401 if token is not provided", async () => {
      const res = await request(server)
        .delete("/users/info/items/me")
        .send(values);
      expect(res.status).toBe(401);
    });
    it("Should return 401 if token is not valie", async () => {
      token = "invalid_token";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return 400 if key is not valid", async () => {
      values = {
        invalid_key: "invalid_value",
      };
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if value in not valid", async () => {
      values.items = "invalid_items";
      let res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if array length is 0 or > 16", async () => {
      values.items = [];
      let res = await exec();
      expect(res.status).toBe(400);

      values.items = new Array(17).fill(
        new mongoose.Types.ObjectId().toString()
      );
      res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 500 if an error occured during the update", async () => {
      jest.spyOn(User.prototype, "save").mockRejectedValue(new Error());
      const res = await exec();
      expect(res.status).toBe(500);
    });
  });

  describe("POST /filters/me", () => {
    let values: any;
    beforeEach(async () => {
      const user = new User(mockUser);
      user.filters.searchFilters.categories = new Map([["Dairy", true]]);
      user.filters.searchFilters.stores = new Map([
        [new mongoose.Types.ObjectId().toString(), true],
      ]);
      user.filters.basketFilters.filteredStores = new Map([
        [new mongoose.Types.ObjectId().toString(), true],
      ]);
      await user.save();
      values = {
        searchFilters: {
          distance: {
            amount: 10,
            units: "km",
          },
          categories: ["Produce"],
          stores: [new mongoose.Types.ObjectId()],
        },
        basketFilters: {
          filteredStores: [new mongoose.Types.ObjectId()],
          maxStores: 5,
        },
      };
    });
    const exec = async () => {
      return await request(server)
        .post("/users/info/filters/me")
        .set("x-auth-token", token)
        .send(values);
    };
    it("Should return 200 if user is updated", async () => {
      const res = await exec();
      expect(res.status).toBe(200);

      const user = await User.findOne({ uid: uid });
      expect(user).toBeDefined();
      if (user) {
        expect(user.filters.searchFilters.distance.amount).toBe(
          values.searchFilters.distance.amount
        );
        expect(user.filters.searchFilters.distance.units).toBe(
          values.searchFilters.distance.units
        );
        expect(user.filters.searchFilters.categories.size).toBe(2);
        expect(user.filters.searchFilters.stores.size).toBe(2);
        expect(user.filters.basketFilters.filteredStores.size).toBe(2);
        expect(user.filters.basketFilters.maxStores).toBe(5);
      }
    });
    it("Should return 200 - No values are required", async () => {
      values = {};
      const res = await exec();
      expect(res.status).toBe(200);
    });
    it("Should return 200 and have no duplicates in the data", async () => {
      const user = await User.findOne({ uid: uid });
      if (user) {
        user.filters.searchFilters.categories = new Map([["Produce", true]]);
        user.filters.searchFilters.stores = new Map([
          [values.searchFilters.stores[0], true],
        ]);
        user.filters.basketFilters.filteredStores = new Map([
          [values.basketFilters.filteredStores[0], true],
        ]);
        await user.save();
      }
      const res = await exec();
      expect(res.status).toBe(200);

      const updatedUser = await User.findOne({ uid: uid });
      expect(updatedUser).toBeDefined();

      if (updatedUser) {
        expect(updatedUser.filters.searchFilters.categories.size).toBe(1);
        expect(updatedUser.filters.searchFilters.stores.size).toBe(1);
        expect(updatedUser.filters.basketFilters.filteredStores.size).toBe(1);
      }
    });
    it("Should return 401 if token is not provided", async () => {
      const res = await request(server)
        .post("/users/info/filters/me")
        .send(values);
      expect(res.status).toBe(401);
    });
    it("Should return 401 if token is not valid", async () => {
      token = "invalid_token";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return 400 if key is not valid", async () => {
      values = {
        invalid_key: "invalid_value",
      };
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if value in not valid", async () => {
      values.searchFilters.distance.amount = "invalid_amount";
      let res = await exec();
      expect(res.status).toBe(400);
      values.searchFilters.distance.amount = 10;

      values.searchFilters.distance.units = "invalid_units";
      res = await exec();
      expect(res.status).toBe(400);
      values.searchFilters.distance.units = "km";

      values.searchFilters.categories = "invalid_categories";
      res = await exec();
      expect(res.status).toBe(400);
      values.searchFilters.categories = ["Produce"];

      values.searchFilters.stores = "invalid_stores";
      res = await exec();
      expect(res.status).toBe(400);
      values.searchFilters.stores = [new mongoose.Types.ObjectId()];

      values.basketFilters.filteredStores = "invalid_filteredStores";
      res = await exec();
      expect(res.status).toBe(400);
      values.basketFilters.filteredStores = [new mongoose.Types.ObjectId()];

      values.basketFilters.maxStores = "invalid_maxStores";
      res = await exec();
      expect(res.status).toBe(400);
      values.basketFilters.maxStores = 4;
    });
    it("Should return 400 if array length is > 32 or number of existing categories", async () => {
      values.searchFilters.categories = new Array(categories.size + 1).fill(
        "Produce"
      );
      let res = await exec();
      expect(res.status).toBe(400);
      values.searchFilters.categories = ["Produce"];

      values.searchFilters.stores = new Array(33).fill(
        new mongoose.Types.ObjectId().toString()
      );
      res = await exec();
      expect(res.status).toBe(400);
      values.searchFilters.stores = [new mongoose.Types.ObjectId().toString()];

      values.basketFilters.filteredStores = new Array(33).fill(
        new mongoose.Types.ObjectId().toString()
      );
      res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 500 if an error occured during the update", async () => {
      jest.spyOn(User.prototype, "save").mockRejectedValue(new Error());
      const res = await exec();
      expect(res.status).toBe(500);
    });
  });

  describe("DELETE /filters/me", () => {
    let values: any;
    beforeEach(async () => {
      values = {
        categories: ["Produce"],
        stores: [new mongoose.Types.ObjectId().toString()],
        filteredStores: [new mongoose.Types.ObjectId().toString()],
        maxStores: null,
      };
      const user = new User(mockUser);
      user.filters.searchFilters.categories.set(values.categories[0], true);
      user.filters.searchFilters.stores.set(values.stores[0], true);
      user.filters.basketFilters.filteredStores.set(
        values.filteredStores[0],
        true
      );
      user.filters.basketFilters.maxStores = values.maxStores;
      await user.save();
    });
    const exec = async () => {
      return await request(server)
        .delete("/users/info/filters/me")
        .set("x-auth-token", token)
        .send(values);
    };
    it("Should return 200 if user is updated", async () => {
      const res = await exec();
      expect(res.status).toBe(200);

      const user = await User.findOne({ uid: uid });
      expect(user).toBeDefined();
      if (user) {
        expect(user.filters.searchFilters.categories.size).toBe(0);
        expect(user.filters.searchFilters.stores.size).toBe(0);
        expect(user.filters.basketFilters.filteredStores.size).toBe(0);
        expect(user.filters.basketFilters.maxStores).toBeNull();
      }
    });
    it("Should return 401 if token is not provided", async () => {
      const res = await request(server)
        .delete("/users/info/filters/me")
        .send(values);
      expect(res.status).toBe(401);
    });
    it("Should return 401 if token is not valid", async () => {
      token = "invalid_token";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return 400 if key is not valid", async () => {
      values = {
        invalid_key: "invalid_value",
      };
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if value in not valid", async () => {
      values.categories = "invalid_categories";
      let res = await exec();
      expect(res.status).toBe(400);
      values.categories = ["Produce"];

      values.stores = "invalid_stores";
      res = await exec();
      expect(res.status).toBe(400);
      values.stores = [new mongoose.Types.ObjectId()];

      values.filteredStores = "invalid_filteredStores";
      res = await exec();
      expect(res.status).toBe(400);
      values.filteredStores = [new mongoose.Types.ObjectId()];

      values.maxStores = "invalid_maxStores";
      res = await exec();
      expect(res.status).toBe(400);
      values.maxStores = 4;
    });
    it("Should return 500 if an error occured during the update", async () => {
      jest.spyOn(User.prototype, "save").mockRejectedValue(new Error());
      const res = await exec();
      expect(res.status).toBe(500);
    });
  });
});
