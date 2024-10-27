const request = require("supertest");
const { User } = require("../../../src/models/users");
const { Supplier } = require("../../../src/models/suppliers");
const { Location } = require("../../../src/models/locations");
const { Item } = require("../../../src/models/items");
const fs = require("fs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");

let server;
let token;
let item1;
let item2;
let item3;
let supplier;

let adminToken;
let user;
let admin;
let name;
let newName;
let email;
let newEmail;
let password;
let newPassword;
let newAddress;
let language;
let userId;
let itemId;

let isAdmin;
let isSupplier;
let adminGetPassword;
let adminUpdatePassword;
let adminDeletePassword;
let adminAddPassword;
let supplierAddPassword;
let supplierUpdatePassword;
let supplierDeletePassword;
let supplierGetPassword;
let newSupplierAddPassword;
let newSupplierGetPassword;
let newSupplierUpdatePassword;
let newSupplierDeletePassword;
let supplierName;
let membership;

let filters;
let target;

describe("/api/users", () => {
  beforeEach(async () => {
    server = require("../../../src/index");
    await server.close();
  });
  afterEach(async () => {
    await User.deleteMany({});
    await Item.deleteMany({});
    await Supplier.deleteMany({});
  });
  afterAll(async () => {
    mongoose.disconnect();
    await server.close();
  });

  describe("/", () => {
    beforeEach(async () => {
      user = new User({
        name: "user",
        email: "user@gmail.com",
        password: "Aa123456",
      });
      token = user.generateAuthToken();
      const salt = await bcrypt.genSalt(1);
      user.password = await bcrypt.hash(user.password, salt);
      await user.save();
    });

    describe("POST /", () => {
      beforeEach(() => {
        name = "abc";
        email = "goldkick7@gmail.com";
        password = "Aa123456";
      });
      const exec = async () => {
        return await request(server)
          .post("/api/users")
          .set("accept-language", "en")
          .send({ name, email, password });
      };
      it("Should return 201 if all ok", async () => {
        const res = await exec();
        expect(res.status).toBe(201);
        const valUser = await User.findOne({ email: email });
        expect(valUser).toBeDefined();
      });
      it("Should send a 400 error if client is already logged in", async () => {
        const res = await request(server)
          .post("/api/users")
          .set("x-auth-token", new User().generateAuthToken())
          .send(name, email, password);
        expect(res.status).toBe(400);
      });
      it("Should return 400 if missing required data", async () => {
        name = undefined;
        let res = await exec();
        expect(res.status).toBe(400);
        name = "abc";
        email = undefined;
        res = await exec();
        expect(res.status).toBe(400);
        email = "a@b.ca";
        password = undefined;
        res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return 400 if name is not between 3 and 30 characters", async () => {
        const nameCases = ["12", Array(32).join("a")];
        for (const nameCase of nameCases) {
          name = nameCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
      });
      it(`Should return 400 if email is above 320 characters or not an email`, async () => {
        const emailCases = [
          `${Array(30).join("a")}@${Array(189).join("a")}.ca`,
          "123",
          "a@c",
          12345,
          [1, 2, 3, 4, 5],
          true,
          false,
        ];
        for (const emailCase of emailCases) {
          email = emailCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
      });
      it(`Should return 400 if password does not respect its conditions`, async () => {
        const passwordCases = [
          "Aa12345",
          `Aa${Array(1024).join("a")}`,
          "aa123456",
          "AA123456",
          "  ",
          "Ö",
          12345678,
          [1, 2, 3, 4, 5, 6, 7, 8],
          true,
          false,
        ];
        for (const passwordCase of passwordCases) {
          password = passwordCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
      });
      it("Should return 400 if email is already registered", async () => {
        user = new User({
          name: "user",
          email: "goldkick7@gmail.com",
          password: "Aa123456",
        });
        await user.save();
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });

    describe("PUT /me", () => {
      beforeEach(async () => {
        password = "Aa123456";
      });
      const exec = async () => {
        return await request(server)
          .put("/api/users/me")
          .set("x-auth-token", token)
          .send({
            name: newName,
            email: newEmail,
            password: newPassword,
            oldPassword: password,
          });
      };
      it(`Should return 200 if all data is ok and return name and email`, async () => {
        newName = "New Name";
        let res = await exec();
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("name");
        newName = undefined;
        newEmail = "new@email.com";
        res = await exec();
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("email");
        newEmail = undefined;
        newPassword = "newPassword";
        res = await exec();
        expect(res.status).toBe(200);
        newPassword = undefined;
      });
      it("Should return 400 if modifications validation did not pass", async () => {
        const nameCases = [
          "12",
          Array(32).join("a"),
          [1, 2, 3],
          true,
          false,
          123,
        ];
        for (const nameCase of nameCases) {
          newName = nameCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        newName = "123";
        const emailCases = [
          `${Array(30).join("a")}@${Array(189).join("a")}.ca`,
          "123@45",
          12345,
          [1, 2, 3, 4, 5],
          true,
          false,
        ];
        for (const emailCase of emailCases) {
          newEmail = emailCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        newEmail = "abc@gmail.com";
        const passwordCases = [
          "Aa12345",
          `Aa${Array(1024).join("a")}`,
          "aa123456",
          "AA123456",
          "  ",
          "Ö",
          12345678,
          [1, 2, 3, 4, 5, 6, 7, 8],
          true,
          false,
        ];
        for (const passwordCase of passwordCases) {
          newPassword = passwordCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        newPassword = "Aa123456";
      });
      it("Should return 400 if old password is not there / not a string", async () => {
        const passwordCases = [
          12345678,
          [1, 2, 3, 4, 5, 6, 7, 8],
          undefined,
          true,
          false,
        ];
        for (const passwordCase of passwordCases) {
          password = passwordCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
      });
      it("Should return 400 if the new email is already registered", async () => {
        const otherUser = new User({
          name: "123",
          email: "xyz@gmail.com",
          password: "Aa123456",
        });
        await otherUser.save();
        newEmail = "xyz@gmail.com";
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return 401 if original password is invalid", async () => {
        newPassword = "newPassword";
        password = "wrongPassword";
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it("Should return 400 if user not found / invalid token", async () => {
        token = new User().generateAuthToken();
        newName = "newName";
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return 401 if use is not logged in / no token found", async () => {
        newName = "New Name";
        const res = await request(server)
          .put("/api/users/me")
          .send({ name: newName });
        expect(res.status).toBe(401);
      });
    });

    describe("DELETE /me", () => {
      beforeEach(async () => {
        password = "Aa123456";
      });
      const exec = async () => {
        return await request(server)
          .delete("/api/users/me")
          .set("x-auth-token", token)
          .send({ password });
      };
      it("Should return 200 if deletion was successful", async () => {
        const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
        const res = await exec();
        const user = await User.findById(decoded._id);
        expect(user).toBeNull();
        expect(res.status).toBe(200);
      });
      it("Should return 401 if use is not logged in / no token found", async () => {
        const res = await request(server)
          .put("/api/users/me")
          .send({ password });
        expect(res.status).toBe(401);
      });
      it("Should return 400 if user not found / invalid token", async () => {
        token = new User().generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return 401 if original password is invalid", async () => {
        password = "wrongPassword";
        const res = await exec();
        expect(res.status).toBe(401);
      });
    });

    describe("GET /", () => {
      beforeEach(async () => {
        adminGetPassword = "adminGet";
        filters = "_id name email isSupplier isAdmin";
        const admin = new User({
          name: "admin",
          email: "admin@gmail.com",
          password: "Aa123456",
          account: { isAdmin: true },
          meta: {
            adminGet: "adminGet",
          },
        });

        adminToken = admin.generateAuthToken();
        const salt = await bcrypt.genSalt(1);
        admin.password = await bcrypt.hash(admin.password, salt);
        const adminSalt = await bcrypt.genSalt(1);
        admin.meta.adminGet = await bcrypt.hash(admin.meta.adminGet, adminSalt);

        await admin.save();
      });
      const exec = async () => {
        return await request(server)
          .get("/api/users")
          .set("x-auth-token", adminToken)
          .send({ adminGetPassword, filters });
      };
      it("Should return 200 and all users if all is ok", async () => {
        const res = await exec();
        expect(res.status).toBe(200);
        expect(res.body).toBeDefined();
      });
      it("Should return 400 if the admin account does not exist", async () => {
        const fakeUser = {
          _id: new mongoose.Types.ObjectId().toHexString(),
          account: { isAdmin: true },
        };
        adminToken = new User(fakeUser).generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return 400 if token is invalid", async () => {
        adminToken = "wrongToken";
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return 400 if blocked data is requested", async () => {
        filters = "meta password";
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return 401 if admin does not have the right adminGetPassword", async () => {
        adminGetPassword = "wrong";
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it("Should return 401 if admin is not logged in", async () => {
        const res = await request(server)
          .get("/api/users")
          .send({ adminGetPassword });
        expect(res.status).toBe(401);
      });
      it("Should return 403 if user is not an admin", async () => {
        const admin = new User({
          name: "fakeUser",
          email: "fakeUser@gmail.com",
          password: "Aa123456",
          account: { isAdmin: false },
        });
        await admin.save();
        adminToken = admin.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
    });

    describe("PUT /:id", () => {
      beforeEach(async () => {
        adminUpdatePassword = "adminUpdate";

        const admin = new User({
          name: "admin",
          email: "admin@gmail.com",
          password: "Aa123456",
          account: { isAdmin: true },
          meta: {
            adminUpdate: "adminUpdate",
          },
        });
        adminToken = admin.generateAuthToken();
        const salt = await bcrypt.genSalt(1);
        admin.password = await bcrypt.hash(admin.password, salt);
        const adminSalt = await bcrypt.genSalt(1);
        admin.meta.adminUpdate = await bcrypt.hash(
          admin.meta.adminUpdate,
          adminSalt
        );
        await admin.save();

        target = user;
      });
      const exec = async () => {
        return await request(server)
          .put("/api/users/" + target.id)
          .set("x-auth-token", adminToken)
          .send({
            name,
            email,
            password,
            isSupplier,
            isAdmin,
            adminUpdatePassword,
          });
      };
      it("Should return 200 and returned user info if all ok", async () => {
        const res = await exec();
        expect(res.status).toBe(200);
      });
      it("Should return 400 if the admin account does not exist", async () => {
        const fakeUser = {
          _id: new mongoose.Types.ObjectId().toHexString(),
          account: { isAdmin: true },
        };
        adminToken = new User(fakeUser).generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return 400 if token is invalid", async () => {
        adminToken = "wrongToken";
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return 401 if admin does not have the right adminUpdatePassword", async () => {
        adminUpdatePassword = "wrong";
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it("Should return 401 if admin is not logged in", async () => {
        const res = await request(server)
          .put("/api/users/" + target.id)
          .send({ adminUpdatePassword });
        expect(res.status).toBe(401);
      });
      it("Should return 403 if user is not an admin", async () => {
        const admin = new User({
          name: "fakeUser",
          email: "fakeUser@gmail.com",
          password: "Aa123456",
          account: { isAdmin: false },
        });
        await admin.save();
        adminToken = admin.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
      it("Should return 404 if user does not exist", async () => {
        target = new User();
        const res = await exec();
        expect(res.status).toBe(404);
      });
    });

    describe("DELETE /:id", () => {
      beforeEach(async () => {
        adminDeletePassword = "adminDelete";

        const admin = new User({
          name: "admin",
          email: "admin@gmail.com",
          password: "Aa123456",
          account: { isAdmin: true },
          meta: {
            adminDelete: "adminDelete",
          },
        });
        adminToken = admin.generateAuthToken();
        const salt = await bcrypt.genSalt(1);
        admin.password = await bcrypt.hash(admin.password, salt);
        const adminSalt = await bcrypt.genSalt(1);
        admin.meta.adminDelete = await bcrypt.hash(
          admin.meta.adminDelete,
          adminSalt
        );
        await admin.save();

        target = user;
      });
      const exec = async () => {
        return await request(server)
          .delete("/api/users/" + target.id)
          .set("x-auth-token", adminToken)
          .send({
            adminDeletePassword,
          });
      };
      it("Should return 200 if all is ok", async () => {
        const res = await exec();
        expect(res.status).toBe(200);
      });
      it("Should return 400 if the admin account does not exist", async () => {
        const fakeUser = {
          _id: new mongoose.Types.ObjectId().toHexString(),
          account: { isAdmin: true },
        };
        adminToken = new User(fakeUser).generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return 401 if admin does not have the right adminDeletePassword", async () => {
        adminDeletePassword = "wrong";
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it("Should return 400 if token is invalid", async () => {
        adminToken = "wrongToken";
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return 401 if admin is not logged in", async () => {
        const res = await request(server)
          .delete("/api/users/" + target.id)
          .send({ adminDeletePassword });
        expect(res.status).toBe(401);
      });
      it("Should return 404 if user does not exist", async () => {
        target = new User();
        const res = await exec();
        expect(res.status).toBe(404);
      });
    });
  });

  describe("/items", () => {
    beforeEach(async () => {
      item1 = new Item({
        name: {
          fr: "Pomme",
          en: "Apple",
          size: "S",
        },
        ref: {
          standard: "PLU",
          code: "12345",
        },
        image: fs.readFileSync("./tests/test_images/Logo_blank.png"),
      });
      item2 = new Item({
        name: {
          fr: "Orange",
          en: "Orange",
          size: "S",
        },
        ref: {
          standard: "PLU",
          code: "54321",
        },
        image: fs.readFileSync("./tests/test_images/Logo_blank.png"),
      });
      await item1.save();
      await item2.save();

      user = new User({
        name: "user",
        email: "user@gmail.com",
        password: "Aa123456",
        items: [
          {
            id: item1.id,
            ref: {
              standard: "PLU",
              code: "12345",
            },
            select: {
              method: "weight",
              units: "kg",
              quantity: 1,
            },
          },
          {
            id: item2.id,
            ref: {
              standard: "PLU",
              code: "54321",
            },
            select: {
              method: "weight",
              units: "kg",
              quantity: 1,
            },
          },
        ],
      });
      await user.save();
      token = user.generateAuthToken();
    });

    describe("GET /me", () => {
      const exec = async () => {
        return await request(server)
          .get("/api/users/items/me")
          .set("x-auth-token", token);
      };
      it("Should return 200 if all is ok", async () => {
        const res = await exec();
        expect(res.status).toBe(200);
      });
      it("Should return 213 if one of the items could not be found", async () => {
        user.items[1] = {
          id: new mongoose.Types.ObjectId(),
          ref: {
            standard: "PLU",
            code: "54321",
          },
          select: {
            method: "weight",
            units: "kg",
            quantity: 1,
          },
        };
        await user.save();
        const res = await exec();
        expect(res.status).toBe(213);
      });
      it("Should return 400 if all items could not be found + delete items", async () => {
        user.items[0] = {
          id: new mongoose.Types.ObjectId(),
          ref: {
            standard: "PLU",
            code: "12345",
          },
          select: {
            method: "weight",
            units: "kg",
            quantity: 1,
          },
        };
        user.items[1] = {
          id: new mongoose.Types.ObjectId(),
          ref: {
            standard: "PLU",
            code: "54321",
          },
          select: {
            method: "weight",
            units: "kg",
            quantity: 1,
          },
        };
        await user.save();
        const res = await exec();
        expect(res.status).toBe(400);
        const validUser = await User.findById(user.id);
        expect(validUser.items.length).toBe(0);
      });
      it("Should return 401 if user is not logged in", async () => {
        const res = await request(server).get("/api/users/items/me");
        expect(res.status).toBe(401);
      });
    });

    describe("POST /me/:id", () => {
      beforeEach(async () => {
        item3 = new Item({
          name: {
            fr: "Poire",
            en: "Peer",
            size: "S",
          },
          ref: {
            standard: "PLU",
            code: "00345",
          },
          image: fs.readFileSync("./tests/test_images/Logo_blank.png"),
        });
        await item3.save();
        itemId = item3.id;
      });
      const exec = async () => {
        return await request(server)
          .post("/api/users/items/me/" + itemId)
          .set("x-auth-token", token);
      };
      it("Should return 200 if all is ok", async () => {
        const res = await exec();
        expect(res.status).toBe(200);
      });
      it("Should return 400 if item is already in list", async () => {
        await exec();
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return 404 if item is not a ObjectId", async () => {
        itemId = "Aaaaaa";
        const res = await exec();
        expect(res.status).toBe(404);
      });
      it("Should return 404 if item does not exist", async () => {
        itemId = new mongoose.Types.ObjectId();
        const res = await exec();
        expect(res.status).toBe(404);
      });
    });

    describe("DELETE /me/:id", () => {
      beforeEach(() => {
        itemId = item1.id;
      });
      const exec = async () => {
        return await request(server)
          .delete("/api/users/items/me/" + itemId)
          .set("x-auth-token", token);
      };
      it("Should return 200 if all is ok", async () => {
        const res = await exec();
        expect(res.status).toBe(200);
      });
      it("Should return 400 if item is not in the list", async () => {
        itemId = new mongoose.Types.ObjectId();
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });
  });

  describe("/location", () => {
    beforeEach(async () => {
      user = new User({
        name: "user",
        email: "user@gmail.com",
        password: "Aa123456",
      });
      await user.save();
      token = user.generateAuthToken();
    });

    describe("POST /me", () => {
      beforeEach(() => {
        newAddress = "414 E 14th street";
      });
      const exec = async () => {
        return await request(server)
          .post("/api/users/location/me")
          .set("x-auth-token", token)
          .send({ newAddress });
      };
      it("Should return 200 if everything is ok", async () => {
        const res = await exec();
        expect(res.status).toBe(201);
        const valUser = await User.findById(user.id);
        expect(valUser.location.formattedAddress).toBeDefined();
      });
      it("Should return 400 if address is not a string", async () => {
        const addressCases = [123, [1, 2, 3], true, false, undefined];
        for (const testCase of addressCases) {
          newAddress = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
      });
      it("Should return 400 if address is not precise enough", async () => {
        newAddress = "1234";
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return 401 if user is not logged in", async () => {
        const res = await request(server)
          .post("/api/users/location/me")
          .send({ newAddress });
        expect(res.status).toBe(401);
      });
    });

    describe("DELETE /me", () => {
      beforeEach(async () => {
        user.location = {
          type: "Point",
          coordinates: [1, 1],
          formattedAddress: "fakeAddress",
        };
        await user.save();
      });
      const exec = async () => {
        return await request(server)
          .delete("/api/users/location/me")
          .set("x-auth-token", token);
      };
      it("Should return 200 if location was deleted", async () => {
        const res = await exec();
        expect(res.status).toBe(200);
        const valUser = await User.findById(user.id);
        expect(valUser.location).toMatchObject({});
      });
      it("Should return 401 if user is not logged in", async () => {
        const res = await request(server).delete("/api/users/location/me");
        expect(res.status).toBe(401);
      });
    });
  });

  describe("/language", () => {
    beforeEach(async () => {
      user = new User({
        name: "user",
        email: "user@gmail.com",
        password: "Aa123456",
      });
      await user.save();
      token = user.generateAuthToken();
    });

    describe("PUT /me", () => {
      beforeEach(() => {
        language = "en";
      });
      const exec = async () => {
        return await request(server)
          .put("/api/users/language/me")
          .set("x-auth-token", token)
          .send({ language });
      };
      it("Should return 200 if all is ok", async () => {
        let res = await exec();
        expect(res.status).toBe(200);
        language = "fr";
        res = await exec();
        expect(res.status).toBe(200);
        const valUser = await User.findById(user.id);
        expect(valUser.preferences.language).toBe("fr");
      });
      it('Should return 400 if language is neither "en" of "fr"', async () => {
        const languageCases = [
          123,
          "123",
          [1, 2, 3],
          true,
          false,
          undefined,
          null,
        ];
        for (const testCase of languageCases) {
          language = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
      });
      it("Should return 401 if user is not logged in", async () => {
        const res = await request(server)
          .put("/api/users/language/me")
          .send({ language });
        expect(res.status).toBe(401);
      });
    });
  });

  describe("/authorization", () => {
    describe("PUT /me", () => {
      beforeEach(async () => {
        user = new User({
          name: "user",
          email: "user@gmail.com",
          password: "Aa123456",
          account: { isSupplier: true },
          meta: {
            supplier: "Supplier",
            supplierAdd: "supplierAdd",
            supplierUpdate: "supplierUpdate",
            supplierDelete: "supplierDelete",
            supplierGet: "supplierGet",
          },
        });
        const salt = await bcrypt.genSalt(1);
        user.meta.supplierAdd = await bcrypt.hash(user.meta.supplierAdd, salt);
        user.meta.supplierUpdate = await bcrypt.hash(
          user.meta.supplierUpdate,
          salt
        );
        user.meta.supplierDelete = await bcrypt.hash(
          user.meta.supplierDelete,
          salt
        );
        user.meta.supplierGet = await bcrypt.hash(user.meta.supplierGet, salt);
        await user.save();
        token = user.generateAuthToken();

        supplierAddPassword = "supplierAdd";
        supplierUpdatePassword = "supplierUpdate";
        supplierDeletePassword = "supplierDelete";
        supplierGetPassword = "supplierGet";
        newSupplierAddPassword = "AAaa12$$90";
        newSupplierGetPassword = "AAaa12$$90";
        newSupplierUpdatePassword = "AAaa12$$90";
        newSupplierDeletePassword = "AAaa12$$90";
      });
      const exec = async () => {
        return await request(server)
          .put("/api/users/authorization/me")
          .set("x-auth-token", token)
          .send({
            supplierAddPassword,
            supplierUpdatePassword,
            supplierDeletePassword,
            supplierGetPassword,
            newSupplierAddPassword,
            newSupplierGetPassword,
            newSupplierUpdatePassword,
            newSupplierDeletePassword,
          });
      };
      it("Should return 200 if all is ok", async () => {
        const res = await exec();
        expect(res.status).toBe(200);
        const valUser = await User.findById(user.id);
        expect(valUser.meta.supplierAdd).toBe("AAaa12$$90");
        expect(valUser.meta.supplierUpdate).toBe("AAaa12$$90");
        expect(valUser.meta.supplierDelete).toBe("AAaa12$$90");
        expect(valUser.meta.supplierGet).toBe("AAaa12$$90");
      });
      it("Should return 400 if schema is not respected", async () => {
        const oldPasswordCases = [123, [1, 2, 3], true, false, undefined];

        for (const testCase of oldPasswordCases) {
          supplierAddPassword = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        supplierAddPassword = "supplierAdd";

        for (const testCase of oldPasswordCases) {
          supplierUpdatePassword = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        supplierUpdatePassword = "supplierUpdate";

        for (const testCase of oldPasswordCases) {
          supplierDeletePassword = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        supplierDeletePassword = "supplierDelete";

        for (const testCase of oldPasswordCases) {
          supplierGetPassword = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        supplierGetPassword = "supplierGet";

        const newPasswordCases = [
          "Aaaa12$$90",
          "AAAa12$90",
          "AAaa1$aaa",
          "AAaa12$890",
          "AAaa12$$9",
          `AAaa12$$${Array(122).join("a")}`,
          true,
          false,
          1234567890,
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        ];

        for (const testCase of newPasswordCases) {
          newSupplierAddPassword = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        newSupplierAddPassword = "AAaa12$$90";

        for (const testCase of newPasswordCases) {
          newSupplierUpdatePassword = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        newSupplierUpdatePassword = "AAaa12$$90";

        for (const testCase of newPasswordCases) {
          newSupplierDeletePassword = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        newSupplierDeletePassword = "AAaa12$$90";

        for (const testCase of newPasswordCases) {
          newSupplierGetPassword = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        newSupplierGetPassword = "AAaa12$$90";
      });
      it("Should return 401 if user is not logged in", async () => {
        const res = await request(server).put("/api/users/authorization/me");
        expect(res.status).toBe(401);
      });
      it("Should return 401 the moment 1 auth password is wrong", async () => {
        supplierAddPassword = "wrong";
        let res = await exec();
        expect(res.status).toBe(401);
        supplierAddPassword = "supplierAdd";

        supplierUpdatePassword = "wrong";
        res = await exec();
        expect(res.status).toBe(401);
        supplierUpdatePassword = "supplierUpdate";

        supplierDeletePassword = "wrong";
        res = await exec();
        expect(res.status).toBe(401);
        supplierDeletePassword = "supplierDelete";

        supplierGetPassword = "wrong";
        res = await exec();
        expect(res.status).toBe(401);
        supplierGetPassword = "supplierGet";
      });
      it("Should return 403 if does not have auth", async () => {
        user = new User({
          name: "Howdy",
          password: "Aa123456",
          email: "a@z.com",
        });
        await user.save();
        token = user.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
    });

    describe("PUT /:id", () => {
      beforeEach(async () => {
        admin = new User({
          name: "admin",
          email: "admin@gmail.com",
          password: "Aa123456",
          account: { isAdmin: true },
          meta: {
            adminAdd: "adminAdd",
            adminUpdate: "adminUpdate",
            adminDelete: "adminDelete",
            adminGet: "adminGet",
          },
        });
        const salt = await bcrypt.genSalt(1);
        admin.meta.adminAdd = await bcrypt.hash(admin.meta.adminAdd, salt);
        admin.meta.adminUpdate = await bcrypt.hash(
          admin.meta.adminUpdate,
          salt
        );
        admin.meta.adminDelete = await bcrypt.hash(
          admin.meta.adminDelete,
          salt
        );
        admin.meta.adminGet = await bcrypt.hash(admin.meta.adminGet, salt);
        await admin.save();
        token = admin.generateAuthToken();

        user = new User({
          name: "user",
          email: "user@gmail.com",
          password: "Aa123456",
        });
        await user.save();

        adminAddPassword = "adminAdd";
        adminUpdatePassword = "adminUpdate";
        adminDeletePassword = "adminDelete";
        adminGetPassword = "adminGet";
        supplierAddPassword = "AAaa12$$90";
        supplierGetPassword = "AAaa12$$90";
        supplierUpdatePassword = "AAaa12$$90";
        supplierDeletePassword = "AAaa12$$90";
        supplierName = "Supplier";

        userId = user.id;
      });
      const exec = async () => {
        return await request(server)
          .put("/api/users/authorization/" + userId)
          .set("x-auth-token", token)
          .send({
            adminAddPassword,
            adminUpdatePassword,
            adminDeletePassword,
            adminGetPassword,
            supplierAddPassword,
            supplierGetPassword,
            supplierUpdatePassword,
            supplierDeletePassword,
            supplierName,
          });
      };
      it("Should return 200 and user name if all is ok", async () => {
        const res = await exec();
        expect(res.status).toBe(200);
        const valUser = await User.findById(userId);
        expect(valUser.meta.supplier).toBe("Supplier");
        expect(valUser.account.isSupplier).toBeTruthy();
        expect(valUser.meta.supplierAdd).toBe("AAaa12$$90");
        expect(valUser.meta.supplierUpdate).toBe("AAaa12$$90");
        expect(valUser.meta.supplierDelete).toBe("AAaa12$$90");
        expect(valUser.meta.supplierGet).toBe("AAaa12$$90");
      });
      it("Should return 400 if schema is not respected", async () => {
        const oldPasswordCases = [123, [1, 2, 3], true, false, undefined];

        for (const testCase of oldPasswordCases) {
          adminAddPassword = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        adminAddPassword = "adminAdd";

        for (const testCase of oldPasswordCases) {
          adminUpdatePassword = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        adminUpdatePassword = "adminUpdate";

        for (const testCase of oldPasswordCases) {
          adminDeletePassword = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        adminDeletePassword = "adminDelete";

        for (const testCase of oldPasswordCases) {
          adminGetPassword = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        adminGetPassword = "adminGet";

        const newPasswordCases = [
          "Aaaa12$$90",
          "AAAa12$90",
          "AAaa1$aaa",
          "AAaa12$890",
          "AAaa12$$9",
          `AAaa12$$${Array(122).join("a")}`,
          true,
          false,
          1234567890,
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
          undefined,
        ];

        for (const testCase of newPasswordCases) {
          supplierAddPassword = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        supplierAddPassword = "AAaa12$$90";

        for (const testCase of newPasswordCases) {
          supplierUpdatePassword = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        supplierUpdatePassword = "AAaa12$$90";

        for (const testCase of newPasswordCases) {
          supplierDeletePassword = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        supplierDeletePassword = "AAaa12$$90";

        for (const testCase of newPasswordCases) {
          supplierGetPassword = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        supplierGetPassword = "AAaa12$$90";

        const nameCases = [123, [1, 2, 3], true, false, undefined];

        for (const testCase of nameCases) {
          supplierName = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        supplierName = "Supplier";
      });
      it("Should return 401 if user is not logged in", async () => {
        const res = await request(server).put(
          "/api/users/authorization/" + userId
        );
        expect(res.status).toBe(401);
      });
      it("Should return 401 if at least 1 auth password is wrong", async () => {
        adminAddPassword = "wrong";
        let res = await exec();
        expect(res.status).toBe(401);
        adminAddPassword = "adminAdd";

        adminUpdatePassword = "wrong";
        res = await exec();
        expect(res.status).toBe(401);
        adminUpdatePassword = "adminUpdate";

        adminDeletePassword = "wrong";
        res = await exec();
        expect(res.status).toBe(401);
        adminDeletePassword = "adminDelete";

        adminGetPassword = "wrong";
        res = await exec();
        expect(res.status).toBe(401);
        adminGetPassword = "adminGet";
      });
      it("Should return 403 if user does not have authorization", async () => {
        token = user.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
      it("Should return 404 if path is not an ObjectId", async () => {
        userId = "1234";
        const res = await exec();
        expect(res.status).toBe(404);
      });
      it("Should return 404 if path does not exist", async () => {
        userId = new mongoose.Types.ObjectId();
        const res = await exec();
        expect(res.status).toBe(404);
      });
    });

    describe("DELETE /:id", () => {
      beforeEach(async () => {
        adminGetPassword = "adminGet";
        adminAddPassword = "adminAdd";
        adminUpdatePassword = "adminUpdate";
        adminDeletePassword = "adminDelete";

        user = new User({
          name: "supplier",
          email: "supplier@email.com",
          password: "Aa123456",
          account: { isSupplier: true },
        });
        await user.save();
        userId = user.id;

        admin = new User({
          name: "admin",
          email: "admin@gmail.com",
          password: "Aa123456",
          account: { isAdmin: true },
          meta: {
            adminAdd: "adminAdd",
            adminUpdate: "adminUpdate",
            adminDelete: "adminDelete",
            adminGet: "adminGet",
          },
        });
        const salt = await bcrypt.genSalt(1);
        admin.meta.adminAdd = await bcrypt.hash(admin.meta.adminAdd, salt);
        admin.meta.adminUpdate = await bcrypt.hash(
          admin.meta.adminUpdate,
          salt
        );
        admin.meta.adminDelete = await bcrypt.hash(
          admin.meta.adminDelete,
          salt
        );
        admin.meta.adminGet = await bcrypt.hash(admin.meta.adminGet, salt);
        await admin.save();
        token = admin.generateAuthToken();
      });
      const exec = async () => {
        return await request(server)
          .delete("/api/users/authorization/" + userId)
          .set("x-auth-token", token)
          .send({
            adminGetPassword,
            adminAddPassword,
            adminUpdatePassword,
            adminDeletePassword,
          });
      };
      it("Should return 200 and user name if all is ok", async () => {
        const res = await exec();
        expect(res.status).toBe(200);
        const valUser = await User.findById(userId);
        expect(valUser.account.isSupplier).not.toBeTruthy();
        expect(valUser.meta.supplier).toBeUndefined();
        expect(valUser.meta.supplierAdd).toBeUndefined();
        expect(valUser.meta.supplierUpdate).toBeUndefined();
        expect(valUser.meta.supplierDelete).toBeUndefined();
        expect(valUser.meta.supplierGet).toBeUndefined();
      });
      it("Should return 400 if schema is not respected", async () => {
        adminAddPassword = 12345;
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return 401 if user is not logged in", async () => {
        const res = await request(server).put(
          "/api/users/authorization/" + userId
        );
        expect(res.status).toBe(401);
      });
      it("Should return 401 if at least 1 auth password is wrong", async () => {
        adminAddPassword = "wrong";
        let res = await exec();
        expect(res.status).toBe(401);
        adminAddPassword = "adminAdd";

        adminUpdatePassword = "wrong";
        res = await exec();
        expect(res.status).toBe(401);
        adminUpdatePassword = "adminUpdate";

        adminDeletePassword = "wrong";
        res = await exec();
        expect(res.status).toBe(401);
        adminDeletePassword = "adminDelete";

        adminGetPassword = "wrong";
        res = await exec();
        expect(res.status).toBe(401);
        adminGetPassword = "adminGet";
      });
      it("Should return 403 if user does not have authorization", async () => {
        token = user.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
      it("Should return 404 if path is not an ObjectId", async () => {
        userId = "1234";
        const res = await exec();
        expect(res.status).toBe(404);
      });
      it("Should return 404 if path does not exist", async () => {
        userId = new mongoose.Types.ObjectId();
        const res = await exec();
        expect(res.status).toBe(404);
      });
    });
  });

  describe("/membership", () => {
    describe("POST /me", () => {
      beforeEach(async () => {
        user = new User({
          name: "user",
          email: "user@gmail.com",
          password: "Aa123456",
          membership: [],
        });
        await user.save();
        token = user.generateAuthToken();
        membership = "Provigo";

        supplier = new Supplier({
          name: "Provigo",
          logo: fs.readFileSync("./tests/test_images/Logo_blank.png"),
        });
        await supplier.save();
      });
      const exec = async () => {
        return await request(server)
          .post("/api/users/membership/me")
          .set("x-auth-token", token)
          .send({ membership });
      };
      it("Should return 200 if all is ok", async () => {
        const res = await exec();
        expect(res.status).toBe(200);
        const user = await User.findOne({ name: "user" });
        expect(user.membership[0]).toBe("Provigo");
      });
      it("Should return 200 even if supplier was already in the list", async () => {
        user.membership = ["Provigo"];
        await user.save();
        const res = await exec();
        expect(res.status).toBe(200);
      });
      it("Should return 400 if membership is not a string", async () => {
        const opts = [1, ["Provigo"], undefined, true, false];
        for (const opt of opts) {
          membership = opt;
          const res = await exec();
          expect(res.status).toBe(400);
        }
      });
      it("Should return 400 if supplier does not exist", async () => {
        membership = "WrongSupplier";
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return 401 if user is not logged in", async () => {
        const res = await request(server)
          .post("/api/users/membership/me")
          .send({ membership });
        expect(res.status).toBe(401);
      });
    });

    describe("DELETE /me", () => {
      beforeEach(async () => {
        user = new User({
          name: "user",
          email: "user@gmail.com",
          password: "Aa123456",
          membership: ["Provigo"],
        });
        await user.save();
        token = user.generateAuthToken();
        membership = "Provigo";
      });
      const exec = async () => {
        return await request(server)
          .delete("/api/users/membership/me")
          .set("x-auth-token", token)
          .send({ membership });
      };
      it("Should return 200 if all is ok", async () => {
        const res = await exec();
        expect(res.status).toBe(200);
        const user = await User.findOne({ name: "user" });
        expect(user.membership[0]).toBe(undefined);
      });
      it("Should return 200 even if supplier is not in the list", async () => {
        user.membership = ["IGA"];
        await user.save();
        const res = await exec();
        expect(res.status).toBe(200);
      });
      it("Should return 400 if membership is not a string", async () => {
        const opts = [1, ["Provigo"], undefined, true, false];
        for (const opt of opts) {
          membership = opt;
          const res = await exec();
          expect(res.status).toBe(400);
        }
      });
      it("Should return 401 if user is not logged in", async () => {
        const res = await request(server)
          .post("/api/users/membership/me")
          .send({ membership });
        expect(res.status).toBe(401);
      });
    });
  });
});
