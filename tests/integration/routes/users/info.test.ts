import http from "http";
import https from "https";
import User from "../../../../src/models/users";
import config from "config";
import mongoose from "mongoose";
import mockUser from "../../../mockData/mockUser";
import request from "supertest";

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

  describe("PUT /me", () => {
    let values: any;
    beforeEach(async () => {
      let user = new User(mockUser);
      user.filters.searchPreferences.categories.set("Produce", true);
      user.filters.searchPreferences.stores.set("Store1", true);
      user.filters.basketFilters.filteredStores.set("FilteredStore1", true);
      user.items.set(new mongoose.Types.ObjectId().toString(), {
          method: "weight",
          units: "kg",
          quantity: 10,
      });
      await user.save();
      const catKeysArr = Array.from(user.filters.searchPreferences.categories.keys());
      const storeKeysArr = Array.from(user.filters.searchPreferences.stores.keys());
      const filteredStoreKeysArr = Array.from(user.filters.basketFilters.filteredStores.keys());
      const itemsKeysArr = Array.from(user.items.keys());
      values = {
        name: "new_name",
        email: "newemail@gmail.com",
        location: {
          country: "Canada",
          type: "Point",
          coordinates: [0, 0],
          formattedAddress: "formatted address",
        },
        membership: {
          add: ['new_membership'],
          remove: [catKeysArr[0]],
        },
        preferences: {
          weightUnits: "kg",
          distUnits: "km",
          language: "en",
        },
        items: {
          add: [
            {
              id: new mongoose.Types.ObjectId().toString(),
              select: {
                method: "weight",
                units: "kg",
                quantity: 10,
              },
            },
          ],
          remove: [itemsKeysArr[0]],
          update: [
            {
              id: itemsKeysArr[1],
              select: {
                method: "unit",
                units: "unit",
                quantity: 5,
              },
            },
          ],
        },
        filters: {
          searchPreferences: {
            distance: {
              amount: 10,
              units: "km",
            },
            categories: {
              add: ["Dairy"],
              remove: ["Produce"],
            },
            stores: {
              add: [new mongoose.Types.ObjectId().toString()],
              remove: [storeKeysArr[0]],
            },
          },
          basketFilters: {
            filteredStores: {
              add: [new mongoose.Types.ObjectId().toString()],
              remove: [filteredStoreKeysArr[0]],
            },
            maxStores: 5,
          },
        },
      };
    });
    const exec = async () => {
      return request(server)
        .put("/users/info/me")
        .set("x-auth-token", token)
        .send(values);
    };
    it("Should return 200 if user is updated successfully", async () => {
      const res = await exec();
      expect(res.status).toBe(200);

      const user = await User.findOne({uid : uid});
      expect(user).toBeDefined();
      if (user) {
        expect(user.name).toBe(values.name);

        expect(user.email).toBe(values.email);

        expect(user.location).toMatchObject(values.location);

        expect(user.membership.has("new_membership")).toBe(true);
        expect(user.membership.has(values.membership.remove[0])).toBe(false);

        expect(user.preferences).toMatchObject(values.preferences);

        expect(user.items.size).toBe(2);
        expect(user.items.has(values.items.add[0].id)).toBe(true);
        expect(user.items.has(values.items.remove[0])).toBe(false);
        expect(user.items.get(values.items.update[0].id)).toMatchObject(values.items.update[0].select);
        expect(user.items.get(values.items.update[0].id)?.method).toBe(values.items.update[0].select.method);

        expect(user.filters.searchPreferences.distance).toMatchObject(values.filters.searchPreferences.distance);
        expect(user.filters.searchPreferences.categories.has("Dairy")).toBe(true);
        expect(user.filters.searchPreferences.categories.has('Produce')).toBe(false);
        expect(user.filters.searchPreferences.stores.has(values.filters.searchPreferences.stores.add[0])).toBe(true);
        expect(user.filters.searchPreferences.stores.has(values.filters.searchPreferences.stores.remove[0])).toBe(false);
        expect(user.filters.basketFilters.filteredStores.has(values.filters.basketFilters.filteredStores.add[0])).toBe(true);
        expect(user.filters.basketFilters.filteredStores.has(values.filters.basketFilters.filteredStores.remove[0])).toBe(false);
        expect(user.filters.basketFilters.maxStores).toBe(values.filters.basketFilters.maxStores);


      }
    });
    it('Should return 200 even if some values aren\'t supported', async () => {
      values.unsupported = "unsupported"; 
      let res = await exec();
      expect(res.status).toBe(200);

      values.membership.unsupported = "unsupported";
      res = await exec();
      expect(res.status).toBe(200);

      values.items.unsupported = "unsupported";
      res = await exec();
      expect(res.status).toBe(200);

      values.filters.unsupported = "unsupported";
      res = await exec();
      expect(res.status).toBe(200);

      values.filters.searchPreferences.unsupported = "unsupported";
      res = await exec();
      expect(res.status).toBe(200);

      values.filters.searchPreferences.categories.unsupported = "unsupported";
      res = await exec();
      expect(res.status).toBe(200);

      values.filters.searchPreferences.stores.unsupported = "unsupported";
      res = await exec();
      expect(res.status).toBe(200);

      values.filters.basketFilters.unsupported = "unsupported";
      res = await exec();
      expect(res.status).toBe(200);

      values.filters.basketFilters.filteredStores.unsupported = "unsupported";
      res = await exec();
      expect(res.status).toBe(200);
    });
    it("Should return 401 if user is not logged in", async () => {
      const res = await request(server).put("/users/info/me").send(values);
      expect(res.status).toBe(401);
    });
    it("Should return 401 if token is invalid", async () => {
      // Should have been a JWT
      token = "invalid";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return 400 if name validation failed", async () => {
      // Should have been a string
      values.name = 123; 
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if email validation failed", async () => {
      // Should have email format
      values.email = "invalid email"; 
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if location validation failed", async () => {
      // Should have location object format
      values.location = "invalid location"; 
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('Should return 400 if membership adding validation failed', async () => {
      // Should have array of strings
      values.membership.add = "invalid"; 
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('Should return 400 if membership removing validation failed', async () => {
      // Should have array of strings
      values.membership.remove = "invalid"; 
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('Should return 400 if preferences validation failed', async () => {
      // Should have preferences object format
      values.preferences = "invalid"; 
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('Should return 400 if items adding validation failed', async () => {
      // Should have array of item objects
      values.items.add = "invalid"; 
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('Should return 400 if items removing validation failed', async () => {
      // Should have array of strings
      values.items.remove = "invalid"; 
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('Should return 400 if items updating validation failed', async () => {
      // Should have array of item objects
      values.items.update = "invalid"; 
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('Should return 400 if searchPreferences distance validation failed', async () => {
      // Should have distance object format
      values.filters.searchPreferences.distance = "invalid"; 
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('Should return 400 if searchPreferences categories adding validation failed', async () => {
      // Should have array of strings
      values.filters.searchPreferences.categories.add = "invalid"; 
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('Should return 400 if searchPreferences categories removing validation failed', async () => {
      // Should have array of strings
      values.filters.searchPreferences.categories.remove = "invalid"; 
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('Should return 400 if searchPreferences stores adding validation failed', async () => {
      // Should have array of strings
      values.filters.searchPreferences.stores.add = "invalid"; 
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('Should return 400 if searchPreferences stores removing validation failed', async () => {
      // Should have array of strings
      values.filters.searchPreferences.stores.remove = "invalid"; 
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('Should return 400 if basketFilters filteredStores adding validation failed', async () => {
      // Should have array of strings
      values.filters.basketFilters.filteredStores.add = "invalid"; 
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('Should return 400 if basketFilters filteredStores removing validation failed', async () => {
      // Should have array of strings
      values.filters.basketFilters.filteredStores.remove = "invalid"; 
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('Should return 400 if basketFilters maxStores validation failed', async () => {
      // Should have number format
      values.filters.basketFilters.maxStores = "invalid"; 
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('Should return 500 if user update failed', async () => {
      jest.spyOn(User.prototype, 'save').mockRejectedValue(new Error());
      const res = await exec();
      expect(res.status).toBe(500);
    });
  });
})
