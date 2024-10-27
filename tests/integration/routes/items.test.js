const request = require("supertest");
const { User } = require("../../../src/models/users");
const { Item } = require("../../../src/models/items");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const fs = require("fs");

let server;

let admin;
let adminAddPassword;
let adminUpdatePassword;
let adminDeletePassword;
let token;

let item;
let itemId;
let name;
let ref;
let amount;
let description;
let brand;
let tags;
let image;

describe("/api/items", () => {
  beforeEach(async () => {
    server = require("../../../src/index");
    await server.close();
  });
  afterEach(async () => {
    await User.deleteMany({});
    await Item.deleteMany({});
  });
  afterAll(async () => {
    mongoose.disconnect();
    await server.close();
  });

  describe("GET /:id", () => {
    beforeEach(async () => {
      image = fs.readFileSync("./tests/test_images/Logo_blank.png");
      item = new Item({
        name: {
          fr: "12345",
          en: "apple",
        },
        ref: {
          standard: "PLU",
          code: "12345",
        },
        amount: {
          isApprox: false,
          meas: "weight",
          units: "g",
          quantity: 100,
        },
        description: "Description...",
        image: image,
      });
      await item.save();
      itemId = item.id;
    });
    const exec = async () => {
      return await request(server).get("/api/items/" + itemId);
    };
    it("Should return 200 if all is ok", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body.ref.code).toBe("12345");
    });
    it("Should return 200 if PLU/UPC/EAN codes are provided", async () => {
      itemId = "12345";
      const res = await exec();
      expect(res.status).toBe(200);
    });
    it("Should return 404 if item does not exist", async () => {
      itemId = new mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    beforeEach(async () => {
      admin = new User({
        name: "admin",
        email: "admin@gmail.com",
        password: "Aa123456",
        account: { isAdmin: true },
        meta: { adminAdd: "adminAdd" },
      });
      const salt = await bcrypt.genSalt(1);
      admin.meta.adminAdd = await bcrypt.hash(admin.meta.adminAdd, salt);
      await admin.save();
      token = admin.generateAuthToken();

      adminAddPassword = "adminAdd";
      name = {
        fr: "Pomme",
        en: "Apple",
        size: "S",
      };
      ref = {
        standard: "PLU",
        code: "12345",
      };
      amount = {
        isApprox: true,
        meas: "weight",
        units: "g",
        quantity: 200,
      };
      description = "Description...";
      brand = "Sunkiss";
      tags = ["Produce"];
      image = fs.readFileSync("./tests/test_images/Logo_blank.png");
    });
    const exec = async () => {
      return await request(server)
        .post("/api/items")
        .set("x-auth-token", token)
        .send({
          adminAddPassword,
          name,
          ref,
          amount,
          description,
          brand,
          tags,
          image,
        });
    };
    it("Should return 200 if all is ok", async () => {
      const res = await exec();
      expect(res.status).toBe(201);
    });
    it("Should return 400 if schema is not respected", async () => {
      adminAddPassword = undefined;
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if amount combinations are wrong", async () => {
      amount.units = "mL";
      let res = await exec();
      expect(res.status).toBe(400);
      amount.units = "g";
      amount.meas = "volume";
      res = await exec();
      expect(res.status).toBe(400);
      amount.units = "unit";
      res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if ref combination is wrong", async () => {
      ref.standard = "EAN";
      let res = await exec();
      expect(res.status).toBe(400);
      ref.standard = "UPC";
      res = await exec();
      expect(res.status).toBe(400);
      ref.standard = "PLU";
      ref.code = "123456789012";
      res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if item already exists", async () => {
      await exec();
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 401 if user is not logged in", async () => {
      const res = await request(server).post("/api/items");
      expect(res.status).toBe(401);
    });
    it("Should return 401 if password is wrong", async () => {
      adminAddPassword = "wrong";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return 403 if user is not admin", async () => {
      admin.account.isAdmin = false;
      await admin.save();
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
        meta: { adminUpdate: "adminUpdate" },
      });
      const salt = await bcrypt.genSalt(1);
      admin.meta.adminUpdate = await bcrypt.hash(admin.meta.adminUpdate, salt);
      await admin.save();
      token = admin.generateAuthToken();

      item = new Item({
        name: {
          fr: "Orange",
          en: "Orange",
          size: "M",
        },
        ref: {
          standard: "UPC",
          code: "123456789012",
        },
        amount: {
          isApprox: false,
          meas: "unit",
          units: "unit",
          quantity: 1,
        },
        description: "New description....",
        brand: "Old brand",
        tags: ["Health Foods"],
        image: fs.readFileSync("./tests/test_images/Logo_blank.png"),
      });
      await item.save();
      itemId = item.id;

      adminUpdatePassword = "adminUpdate";
      name = {
        fr: "Pomme",
        en: "Apple",
        size: "S",
      };
      ref = {
        standard: "PLU",
        code: "12345",
      };
      amount = {
        isApprox: true,
        meas: "weight",
        units: "g",
        quantity: 200,
      };
      description = "Description...";
      brand = "Sunkiss";
      tags = ["Produce"];
      image = fs.readFileSync("./tests/test_images/Logo_blank.png");
    });
    const exec = async () => {
      return await request(server)
        .put("/api/items/" + itemId)
        .set("x-auth-token", token)
        .send({
          adminUpdatePassword,
          name,
          ref,
          amount,
          description,
          brand,
          tags,
          image,
        });
    };
    it("Should return 200 if all is ok", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
    });
    it("Should return 400 if schema is not respected", async () => {
      adminUpdatePassword = undefined;
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if amount combinations are wrong", async () => {
      amount.units = "mL";
      let res = await exec();
      expect(res.status).toBe(400);
      amount.units = "g";
      amount.meas = "volume";
      res = await exec();
      expect(res.status).toBe(400);
      amount.units = "unit";
      res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if ref combination is wrong", async () => {
      ref.standard = "EAN";
      let res = await exec();
      expect(res.status).toBe(400);
      ref.standard = "UPC";
      res = await exec();
      expect(res.status).toBe(400);
      ref.standard = "PLU";
      ref.code = "123456789012";
      res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 401 if user is not logged in", async () => {
      const res = await request(server).put("/api/items/" + itemId);
      expect(res.status).toBe(401);
    });
    it("Should return 401 if password is incorrect", async () => {
      adminUpdatePassword = "wrong";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return 403 if user is not an admin", async () => {
      admin.account.isAdmin = false;
      await admin.save();
      const res = await exec();
      expect(res.status).toBe(403);
    });
    it("Should return 404 if :id is not an ObjectId", async () => {
      itemId = "aaaaa";
      const res = await exec();
      expect(res.status).toBe(404);
    });
    it("Should return 404 if item does not exist", async () => {
      itemId = new mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /:id", () => {
    beforeEach(async () => {
      adminDeletePassword = "adminDelete";

      item = new Item({
        name: {
          fr: "Pomme",
          en: "Apple",
        },
        ref: {
          standard: "PLU",
          code: "12345",
        },
        amount: {
          isApprox: false,
          meas: "weight",
          units: "g",
          quantity: 100,
        },
        image: fs.readFileSync("./tests/test_images/Logo_blank.png"),
      });
      await item.save();
      itemId = item.id;

      admin = new User({
        name: "admin",
        email: "admin@gmail.com",
        password: "Aa123456",
        account: { isAdmin: true },
        meta: {
          adminDelete: "adminDelete",
        },
      });
      const salt = await bcrypt.genSalt(1);
      admin.meta.adminDelete = await bcrypt.hash(admin.meta.adminDelete, salt);
      await admin.save();
      token = admin.generateAuthToken();
    });
    const exec = async () => {
      return await request(server)
        .delete("/api/items/" + itemId)
        .set("x-auth-token", token)
        .send({ adminDeletePassword });
    };
    it("Should return 200 if all is ok", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
    });
    it("Should return 400 if schema is not respected", async () => {
      const testCases = [123, [1, 2, 3], true, false, undefined];
      for (const testCase of testCases) {
        adminDeletePassword = testCase;
        const res = await exec();
        expect(res.status).toBe(400);
      }
    });
    it("Should return 401 if user is not logged in", async () => {
      const res = await request(server)
        .delete("/api/items/" + itemId)
        .send({ adminDeletePassword });
      expect(res.status).toBe(401);
    });
    it("Should return 401 if invalid password", async () => {
      adminDeletePassword = "wrong";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return 403 if user is not an admin", async () => {
      admin.account.isAdmin = false;
      await admin.save();
      const res = await exec();
      expect(res.status).toBe(403);
    });
    it("Should return 404 if :id is not an ObjectId", async () => {
      itemId = "aaaaa";
      const res = await exec();
      expect(res.status).toBe(404);
    });
    it("Should return 404 if item does not exist", async () => {
      itemId = new mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });
  });
});
