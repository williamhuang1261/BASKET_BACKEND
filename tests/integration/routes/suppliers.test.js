const request = require("supertest");
const { Item } = require("../../../src/models/items");
const { Supplier } = require("../../../src/models/suppliers");
const { User } = require("../../../src/models/users");
const { Location } = require("../../../src/models/locations");
const geocoder = require("../../../src/utils/geocoder");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const fs = require("fs");

let server;

let admin;
let user;
let supplier;
let supplier2;
let token;
let supplierId;
let locationId;

let item1;
let item2;
let item3;
let location1;
let location2;

let payload;
let name;
let supplierName;
let code;
let pricing;
let priceDelIndex;

let adminAddPassword;
let adminUpdatePassword;
let adminDeletePassword;
let supplierAddPassword;
let supplierUpdatePassword;
let supplierDeletePassword;

describe("/api/suppliers", () => {
  beforeEach(async () => {
    server = require("../../../src/index");
    await server.close();
  });
  afterEach(async () => {
    await Item.deleteMany({});
    await User.deleteMany({});
    await Supplier.deleteMany({});
    await Location.deleteMany({});
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await server.close();
  });

  describe("/", () => {
    beforeEach(async () => {
      admin = new User({
        name: "admin",
        email: "admin@gmail.com",
        password: "Aa123456",
        account: { isAdmin: true },
        meta: {
          adminAdd: "adminAdd",
          adminGet: "adminGet",
          adminDelete: "adminDelete",
          adminUpdate: "adminUpdate",
        },
      });
      let salt = await bcrypt.genSalt(1);
      admin.meta.adminAdd = await bcrypt.hash(admin.meta.adminAdd, salt);
      admin.meta.adminUpdate = await bcrypt.hash(admin.meta.adminUpdate, salt);
      admin.meta.adminGet = await bcrypt.hash(admin.meta.adminGet, salt);
      admin.meta.adminDelete = await bcrypt.hash(admin.meta.adminDelete, salt);

      user = new User({
        name: "user",
        email: "user@gmail.com",
        password: "Aa123456",
        account: { isSupplier: true },
        meta: {
          supplier: "AppleProviderCo",
          supplierAdd: "supplierAdd",
          supplierGet: "supplierGet",
          supplierDelete: "supplierDelete",
          supplierUpdate: "supplierUpdate",
        },
      });
      user.meta.supplierAdd = await bcrypt.hash(user.meta.supplierAdd, salt);
      user.meta.supplierUpdate = await bcrypt.hash(
        user.meta.supplierUpdate,
        salt
      );
      user.meta.supplierGet = await bcrypt.hash(user.meta.supplierGet, salt);
      user.meta.supplierDelete = await bcrypt.hash(
        user.meta.supplierDelete,
        salt
      );

      await admin.save();
      await user.save();
    });

    describe("POST /", () => {
      beforeEach(async () => {
        supplierName = "AppleProviderCo";
        logo = fs.readFileSync("./tests/test_images/Logo_blank.png");
        adminAddPassword = "adminAdd";
        token = admin.generateAuthToken();
      });

      const exec = async () => {
        return await request(server)
          .post("/api/suppliers")
          .set("x-auth-token", token)
          .send({ supplierName, logo, adminAddPassword });
      };

      it("Should return 201 if supplier was created", async () => {
        const res = await exec();
        expect(res.status).toBe(201);
        const validation = await Supplier.findOne({ name: supplierName });
        expect(validation).toBeDefined();
      });
      it("Should return 400 if schema is not respected", async () => {
        const supplierNameCases = [
          "12",
          Array(52).join("a"),
          123,
          true,
          false,
          undefined,
        ];
        for (const testCase of supplierNameCases) {
          supplierName = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        supplierName = "abc";

        const adminPasswordCases = [123, [1, 2, 3], true, false];
        for (const testCase of adminPasswordCases) {
          adminAddPassword = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
      });
      it("Should return 400 if name is already used", async () => {
        supplier = new Supplier({
          name: "AppleProviderCo",
          logo: fs.readFileSync("./tests/test_images/Logo_blank.png"),
        });
        await supplier.save();
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return 401 if user is not logged in", async () => {
        const res = await request(server)
          .post("/api/suppliers")
          .send({ supplierName, adminAddPassword });
        expect(res.status).toBe(401);
      });
      it("Should return 401 if password is incorrect", async () => {
        adminAddPassword = "wrongPassword";
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it("Should return 403 if user is not an admin", async () => {
        const fakeUser = new User({
          name: "fakeUser",
          email: "fakeUser@gmail.com",
          password: "Aa123456",
        });
        await fakeUser.save();
        token = fakeUser.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
    });

    describe("PUT /me", () => {
      beforeEach(async () => {
        token = user.generateAuthToken();
        supplierUpdatePassword = "supplierUpdate";
        adminUpdatePassword = "adminUpdate";
        supplier = new Supplier({
          name: "AppleProviderCo",
          logo: fs.readFileSync("./tests/test_images/Logo_blank.png"),
        });

        await supplier.save();

        logo = fs.readFileSync("./tests/test_images/Logo_blank.png");
        name = "New Company Name";
      });
      const exec = async () => {
        return await request(server)
          .put("/api/suppliers/me")
          .set("x-auth-token", token)
          .send({
            supplierName,
            supplierUpdatePassword,
            adminUpdatePassword,
            logo,
            name,
          });
      };
      it("Should return 200 if all is ok", async () => {
        token = admin.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(200);
        const validUser = await User.findOne({ "meta.supplier": name });
        expect(validUser).toBeDefined();
      });
      it("Should return 400 if schema is not respected", async () => {
        supplierUpdatePassword = 12345;
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return 400 if no supplier was found (isSupplier)", async () => {
        user.meta.supplier = "wrong";
        await user.save();
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return 400 if name is already used", async () => {
        supplier2 = new Supplier({
          name: "New Company Name",
          logo: fs.readFileSync("./tests/test_images/Logo_blank.png"),
        });
        await supplier2.save();
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return 400 if no supplier was found (isAdmin)", async () => {
        token = admin.generateAuthToken();
        adminUpdatePassword = "adminUpdate";
        supplierName = "wrong";
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return 401 if user is not logged in", async () => {
        const res = await request(server).put("/api/suppliers/me");
        expect(res.status).toBe(401);
      });
      it("Should return 401 if password is invalid", async () => {
        supplierUpdatePassword = undefined;
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it("Should return 403 if does not have auth", async () => {
        user.account.isSupplier = false;
        await user.save();
        const res = await exec();
        expect(res.status).toBe(403);
      });
    });

    describe("DELETE /", () => {
      beforeEach(async () => {
        supplier = new Supplier({
          name: "AppleProviderCo",
          logo: fs.readFileSync("./tests/test_images/Logo_blank.png"),
        });
        await supplier.save();
        supplierId = supplier.id;
        token = admin.generateAuthToken();
        adminDeletePassword = "adminDelete";
      });
      const exec = async () => {
        return await request(server)
          .delete("/api/suppliers/" + supplierId)
          .set("x-auth-token", token)
          .send({ adminDeletePassword });
      };
      it("Should return 200 if deletion is successful", async () => {
        const res = await exec();
        expect(res.status).toBe(200);
      });
      it("Should return 400 if schema is not respected", async () => {
        const adminPasswordCases = [123, [1, 2, 3], true, false];
        for (const testCase of adminPasswordCases) {
          adminDeletePassword = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
      });
      it("Should return 401 if password is incorrect", async () => {
        adminDeletePassword = "wrongPassword";
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it("Should return 401 if user is not logged in", async () => {
        const res = await request(server)
          .delete("/api/suppliers/" + supplierId)
          .send({ adminDeletePassword });
        expect(res.status).toBe(401);
      });
      it("Should return 403 if user is not an admin", async () => {
        token = user.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
      it("Should return 404 if :id is not an ObjectId", async () => {
        supplierId = "aaaaa";
        const res = await exec();
        expect(res.status).toBe(404);
      });
      it("Should return 404 if item does not exist", async () => {
        supplierId = new mongoose.Types.ObjectId();
        const res = await exec();
        expect(res.status).toBe(404);
      });
    });
  });

  // TODO: Test case for all Items API
  // describe("/items", () => {
  //   beforeEach(async () => {
  //     item1 = new Item({
  //       name: {
  //         fr: "Pomme",
  //         en: "Apple",
  //         size: "S",
  //       },
  //       ref: {
  //         standard: "PLU",
  //         code: "12345",
  //       },
  //       amount: {
  //         isApprox: true,
  //         meas: "weight",
  //         units: "mg",
  //         quantity: 10,
  //       },
  //       suppliers: [
  //         {
  //           supplier: "Company",
  //           pricing: {
  //             normal: 1,
  //             method: "unit",
  //           },
  //         },
  //       ],
  //       description: "Description...",
  //       brand: "MyBrand",
  //       tags: ["Produce", "Health Foods"],
  //       image: fs.readFileSync("./tests/test_images/Logo_blank.png"),
  //     });
  //     item2 = new Item({
  //       name: {
  //         fr: "Poire",
  //         en: "Pear",
  //         size: "S",
  //       },
  //       ref: {
  //         standard: "PLU",
  //         code: "23456",
  //       },
  //       amount: {
  //         isApprox: true,
  //         meas: "weight",
  //         units: "mg",
  //         quantity: 10,
  //       },
  //       suppliers: [
  //         {
  //           supplier: "Company",
  //           pricing: {
  //             normal: 2,
  //             method: "unit",
  //           },
  //         },
  //       ],
  //       description: "Description...",
  //       brand: "MyBrand",
  //       tags: ["Produce", "Health Foods"],
  //       image: fs.readFileSync("./tests/test_images/Logo_blank.png"),
  //     });
  //     await item1.save();
  //     await item2.save();

  //     supplier = new Supplier({
  //       name: "Company",
  //       logo: fs.readFileSync("./tests/test_images/Logo_blank.png"),
  //       items: [
  //         {
  //           item: {
  //             code: item1.ref.code,
  //             id: item1.id,
  //           },
  //           pricing: {
  //             normal: 1,
  //             method: "unit",
  //           },
  //         },
  //         {
  //           item: {
  //             code: item2.ref.code,
  //             id: item2.id,
  //           },
  //           pricing: {
  //             normal: 2,
  //             method: "unit",
  //           },
  //         },
  //       ],
  //     });
  //     await supplier.save();
  //   });

  //   describe("GET /:id", () => {
  //     beforeEach(async () => {
  //       supplierId = supplier.id;
  //     });
  //     const exec = async () => {
  //       return await request(server).get("/api/suppliers/items/" + supplierId);
  //     };
  //     it("Should return 200 if all is ok", async () => {
  //       const res = await exec();
  //       expect(res.status).toBe(200);
  //       expect(res.body.name).toBe(supplier.name);
  //       expect(res.body.items.length).toBe(2);
  //     });
  //     it("Should return 404 if :id is not an ObjectId", async () => {
  //       supplierId = "aaaaa";
  //       const res = await exec();
  //       expect(res.status).toBe(404);
  //     });
  //     it("Should return 404 if no supplier was found", async () => {
  //       supplierId = new mongoose.Types.ObjectId();
  //       const res = await exec();
  //       expect(res.status).toBe(404);
  //     });
  //   });

  //   describe("POST /me", () => {
  //     beforeEach(async () => {
  //       supplier.items.splice(0, 1);
  //       item1.suppliers.splice(0, 1);
  //       await supplier.save();

  //       supplierAddPassword = "supplierAdd";
  //       adminAddPassword = "adminAdd";
  //       supplierName = "Company";
  //       code = "12345";
  //       pricing = {
  //         normal: 1.02,
  //         method: "weight_kg",
  //         limited: {
  //           typeOfRebate: "buyXgetYforC",
  //           X: 1,
  //           Y: 1,
  //           C: 0.51,
  //           rebatePricing: "unit",
  //           start: Date.now(),
  //           end: Date.now(),
  //           onlyMembers: true,
  //         },
  //       };

  //       admin = new User({
  //         name: "admin",
  //         email: "admin@gmail.com",
  //         password: "Aa123456",
  //         account: { isAdmin: true },
  //         meta: { adminAdd: "adminAdd" },
  //       });
  //       const salt = await bcrypt.genSalt(1);
  //       admin.meta.adminAdd = await bcrypt.hash(admin.meta.adminAdd, salt);
  //       await admin.save();
  //       token = admin.generateAuthToken();
  //     });
  //     const exec = async () => {
  //       return await request(server)
  //         .post("/api/suppliers/items/me")
  //         .set("x-auth-token", token)
  //         .send({
  //           supplierAddPassword,
  //           adminAddPassword,
  //           supplierName,
  //           code,
  //           pricing,
  //         });
  //     };
  //     it("Should return 200 if all is ok", async () => {
  //       const res = await exec();
  //       expect(res.status).toBe(200);
  //       const validSup = await Supplier.findById(supplier.id);
  //       expect(validSup.items.length).toBe(2);
  //     });
  //     it("Should return 200 even if a file was corrupted", async () => {
  //       supplier.items.push({
  //         item: {
  //           code: item1.ref.code,
  //           id: item1.id,
  //         },
  //         pricing: {
  //           normal: 1,
  //           method: "unit",
  //         },
  //       });
  //       item1.suppliers.push({
  //         supplier: "Company",
  //         pricing: {
  //           normal: 1,
  //           method: "unit",
  //         },
  //       });
  //       await supplier.save();
  //       const res = await exec();
  //       expect(res.status).toBe(200);
  //       const validSup = await Supplier.findById(supplier.id);
  //       expect(validSup.items.length).toBe(2);
  //     });
  //     it("Should return 200 if schema is not respected", async () => {
  //       code = undefined;
  //       const res = await exec();
  //       expect(res.status).toBe(400);
  //     });
  //     it("Should return 400 if supplier is not linked to a supplier", async () => {
  //       user = new User({
  //         name: "user",
  //         email: "email@gmail.com",
  //         password: "Aa123456",
  //         account: { isSupplier: true },
  //         meta: { supplierAdd: "supplierAdd", supplier: "wrong" },
  //       });
  //       const salt = await bcrypt.genSalt(1);
  //       user.meta.supplierAdd = await bcrypt.hash(user.meta.supplierAdd, salt);
  //       await user.save();
  //       token = user.generateAuthToken();
  //       const res = await exec();
  //       expect(res.status).toBe(400);
  //     });
  //     it("Should return 400 if admin did not provide a valid supplierName", async () => {
  //       supplierName = "wrong";
  //       const res = await exec();
  //       expect(res.status).toBe(400);
  //     });
  //     it("Should return 400 if no item was found", async () => {
  //       code = "99999";
  //       const res = await exec();
  //       expect(res.status).toBe(400);
  //     });
  //     it("Should return 400 if lim price combinations are wrong", async () => {
  //       pricing.limited.Y = undefined;
  //       let res = await exec();
  //       expect(res.status).toBe(400);

  //       pricing.limited.typeOfRebate = "C";
  //       pricing.limited.C = undefined;
  //       res = await exec();
  //       expect(res.status).toBe(400);
  //       pricing.limited.C = 10;

  //       pricing.limited.typeOfRebate = "XforC";
  //       pricing.limited.X = undefined;
  //       res = await exec();
  //       expect(res.status).toBe(400);
  //     });
  //     it("Should return 400 if dates are invalid", async () => {
  //       pricing.limited.end = Date.now() - 100000;
  //       const res = await exec();
  //       expect(res.status).toBe(400);
  //     });
  //     it("Should return 401 if user is not logged in", async () => {
  //       const res = await request(server).post("/api/suppliers/items/me");
  //       expect(res.status).toBe(401);
  //     });
  //     it("Should return 401 if password is invalid", async () => {
  //       adminAddPassword = undefined;
  //       const res = await exec();
  //       expect(res.status).toBe(401);
  //     });
  //     it("Should return 403 if user does not have the right auth", async () => {
  //       admin.isAdmin = false;
  //       await admin.save();
  //       const res = await exec();
  //       expect(res.status).toBe(403);
  //     });
  //   });

  //   describe("PUT /price/me", () => {
  //     beforeEach(async () => {
  //       supplierUpdatePassword = "supplierUpdate";
  //       adminUpdatePassword = "adminUpdate";
  //       supplierName = "Company";
  //       code = "12345";
  //       pricing = {
  //         normal: 6.66,
  //         method: "weight_lb",
  //         limited: {
  //           typeOfRebate: "buyXgetYforC",
  //           X: 2,
  //           Y: 2,
  //           C: 0.22,
  //           rebatePricing: "unit",
  //           start: Date.now(),
  //           end: Date.now() + 1000,
  //           onlyMembers: false,
  //         },
  //       };

  //       user = new User({
  //         name: "supplier",
  //         email: "supplier@gmail.com",
  //         password: "Aa123456",
  //         account: { isSupplier: true },
  //         meta: { supplier: "Company", supplierUpdate: "supplierUpdate" },
  //       });
  //       const salt = await bcrypt.genSalt(1);
  //       user.meta.supplierUpdate = await bcrypt.hash(
  //         user.meta.supplierUpdate,
  //         salt
  //       );
  //       await user.save();
  //       token = user.generateAuthToken();
  //     });
  //     const exec = async () => {
  //       return await request(server)
  //         .put("/api/suppliers/items/price/me")
  //         .set("x-auth-token", token)
  //         .send({
  //           supplierUpdatePassword,
  //           adminUpdatePassword,
  //           supplierName,
  //           code,
  //           pricing,
  //         });
  //     };
  //     it("Should return 200 if all is ok", async () => {
  //       const res = await exec();
  //       expect(res.status).toBe(200);
  //       const valSupplier = await Supplier.findOne({ name: supplierName });
  //       expect(valSupplier.items.length).toBe(2);
  //       expect(valSupplier.items[0].pricing.normal).toBe(pricing.normal);
  //     });
  //     it("Should return 200 if new item must be created", async () => {
  //       supplier.items.splice(0, 1);
  //       await supplier.save();
  //       const res = await exec();
  //       const valSup = await Supplier.findById(supplier.id);
  //       expect(res.status).toBe(200);
  //       expect(valSup.items.length).toBe(2);
  //     });
  //     it("Should return 200 if new suplier must be created", async () => {
  //       item1.suppliers.splice(0, 1);
  //       await item1.save();
  //       const res = await exec();
  //       const valItem = await Item.findById(item1.id);
  //       expect(res.status).toBe(200);
  //       expect(valItem.suppliers.length).toBe(1);
  //     });
  //     it("Should return 400 if schema is not respected", async () => {
  //       code = undefined;
  //       const res = await exec();
  //       expect(res.status).toBe(400);
  //     });
  //     it("Should return 400 if no valid supplier was provided", async () => {
  //       admin = new User({
  //         name: "admin",
  //         email: "admin@gmail.com",
  //         password: "Aa123456",
  //         account: { isAdmin: true },
  //         meta: { adminUpdate: "adminUpdate" },
  //       });
  //       const salt = await bcrypt.genSalt(1);
  //       admin.meta.adminUpdate = await bcrypt.hash(
  //         admin.meta.adminUpdate,
  //         salt
  //       );
  //       await admin.save();
  //       token = admin.generateAuthToken();
  //       supplierName = "Nonexistant";
  //       const res = await exec();
  //       expect(res.status).toBe(400);
  //     });
  //     it("Should return 400 if no valid supplier is linked to user", async () => {
  //       user.meta.supplier = "Invalid";
  //       await user.save();
  //       const res = await exec();
  //       expect(res.status).toBe(400);
  //     });
  //     it("Should return 400 if no valid item was provided", async () => {
  //       code = "00000";
  //       const res = await exec();
  //       expect(res.status).toBe(400);
  //     });
  //     it("Should return 400 if limited combinations are invalid", async () => {
  //       pricing.limited.typeOfRebate = undefined;
  //       let res = await exec();
  //       expect(res.status).toBe(400);
  //       pricing.limited.typeOfRebate = "buyXgetYforC";

  //       pricing.limited.Y = undefined;
  //       res = await exec();
  //       expect(res.status).toBe(400);

  //       pricing.limited.typeOfRebate = "buyXforC";
  //       pricing.limited.X = undefined;
  //       res = await exec();
  //       expect(res.status).toBe(400);

  //       pricing.limited.typeOfRebate = "C";
  //       pricing.limited.C = undefined;
  //       res = await exec();
  //       expect(res.status).toBe(400);
  //       pricing.limited.C = 2;

  //       pricing.limited.start = undefined;
  //       res = await exec();
  //       expect(res.status).toBe(400);
  //       pricing.limited.start = Date.now();

  //       pricing.limited.end = undefined;
  //       res = await exec();
  //       expect(res.status).toBe(400);
  //       pricing.limited.end = Date.now();

  //       pricing.limited.start = Date.now() + 20000;
  //       res = await exec();
  //       expect(res.status).toBe(400);
  //     });
  //     it("Should return 400 if new item must be created and data is missing", async () => {
  //       supplier.items.splice(0, 1);
  //       await supplier.save();
  //       pricing.normal = undefined;
  //       const res = await exec();
  //       expect(res.status).toBe(400);
  //     });
  //     it("Should return 400 if new supplier must be created and data is missing", async () => {
  //       item1.suppliers.splice(0, 1);
  //       await item1.save();
  //       pricing.normal = undefined;
  //       const res = await exec();
  //       expect(res.status).toBe(400);
  //     });
  //     it("Should return 401 if password is incorrect", async () => {
  //       supplierUpdatePassword = "wrong";
  //       const res = await exec();
  //       expect(res.status).toBe(401);
  //     });
  //     it("Should return 401 if user is not logged in", async () => {
  //       const res = await request(server).put("/api/suppliers/items/price/me");
  //       expect(res.status).toBe(401);
  //     });
  //     it("Should return 403 if user does not have proper auth", async () => {
  //       user.account.isSupplier = false;
  //       await user.save();
  //       const res = await exec();
  //       expect(res.status).toBe(403);
  //     });
  //   });

  //   describe("DELETE /items/me", () => {
  //     beforeEach(async () => {
  //       adminDeletePassword = "adminDelete";
  //       supplierDeletePassword = "supplierDelete";
  //       supplierName = "Company";
  //       code = "12345";

  //       user = new User({
  //         name: "supplier",
  //         email: "supplier@gmail.com",
  //         password: "Aa123456",
  //         account: { isSupplier: true },
  //         meta: { supplier: "Company", supplierDelete: "supplierDelete" },
  //       });
  //       const salt = await bcrypt.genSalt(1);
  //       user.meta.supplierDelete = await bcrypt.hash(
  //         user.meta.supplierDelete,
  //         salt
  //       );
  //       await user.save();
  //       token = user.generateAuthToken();
  //     });
  //     const exec = async () => {
  //       return await request(server)
  //         .delete("/api/suppliers/items/me")
  //         .set("x-auth-token", token)
  //         .send({
  //           adminDeletePassword,
  //           supplierDeletePassword,
  //           supplierName,
  //           code,
  //         });
  //     };
  //     it("Should return 200 if all is ok", async () => {
  //       const res = await exec();
  //       expect(res.status).toBe(200);
  //       const valSup = await Supplier.findById(supplier.id);
  //       expect(valSup.items.length).toBe(1);
  //       const valItem = await Item.findById(item1.id);
  //       expect(valItem.suppliers.length).toBe(0);
  //     });
  //     it("Should return 400 if schema is not respected", async () => {
  //       code = undefined;
  //       const res = await exec();
  //       expect(res.status).toBe(400);
  //     });
  //     it("Should return 400 if no valid supplier was provided", async () => {
  //       admin = new User({
  //         name: "admin",
  //         email: "admin@gmail.com",
  //         password: "Aa123456",
  //         account: { isAdmin: true },
  //         meta: { adminDelete: "adminDelete" },
  //       });
  //       const salt = await bcrypt.genSalt(1);
  //       admin.meta.adminDelete = await bcrypt.hash(
  //         admin.meta.adminDelete,
  //         salt
  //       );
  //       await admin.save();
  //       token = admin.generateAuthToken();
  //       supplierName = "Nonexistant";
  //       const res = await exec();
  //       expect(res.status).toBe(400);
  //     });
  //     it("Should return 400 if no valid supplier is linked to user", async () => {
  //       user.meta.supplier = "Invalid";
  //       await user.save();
  //       const res = await exec();
  //       expect(res.status).toBe(400);
  //     });
  //     it("Should return 400 if no valid item was provided", async () => {
  //       code = "00000";
  //       const res = await exec();
  //       expect(res.status).toBe(400);
  //     });
  //     it("Should return 401 if password is incorrect", async () => {
  //       supplierDeletePassword = "wrong";
  //       const res = await exec();
  //       expect(res.status).toBe(401);
  //     });
  //     it("Should return 401 if user is not logged in", async () => {
  //       const res = await request(server).delete("/api/suppliers/items/me");
  //       expect(res.status).toBe(401);
  //     });
  //     it("Should return 403 if user does not have proper auth", async () => {
  //       user.account.isSupplier = false;
  //       await user.save();
  //       const res = await exec();
  //       expect(res.status).toBe(403);
  //     });
  //   });

  //   describe("DELETE /items/price/me", () => {
  //     beforeEach(async () => {
  //       adminDeletePassword = "adminDelete";
  //       supplierDeletePassword = "supplierDelete";
  //       supplierName = "Company";
  //       code = "12345";
  //       priceDelIndex = 0;

  //       user = new User({
  //         name: "supplier",
  //         email: "supplier@gmail.com",
  //         password: "Aa123456",
  //         account: { isSupplier: true },
  //         meta: { supplier: "Company", supplierDelete: "supplierDelete" },
  //       });
  //       const salt = await bcrypt.genSalt(1);
  //       user.meta.supplierDelete = await bcrypt.hash(
  //         user.meta.supplierDelete,
  //         salt
  //       );
  //       await user.save();
  //       token = user.generateAuthToken();

  //       supplier.items[0].pricing.limited = [
  //         {
  //           typeOfRebate: "C",
  //           C: 1,
  //           start: Date.now(),
  //           end: Date.now() + 10,
  //           onlyMembers: true,
  //         },
  //       ];
  //       await supplier.save();

  //       item1.suppliers[0].pricing.limited = [
  //         {
  //           typeOfRebate: "C",
  //           C: 1,
  //           start: supplier.items[0].pricing.limited[0].start,
  //           end: supplier.items[0].pricing.limited[0].end,
  //           onlyMembers: false,
  //         },
  //       ];
  //       await item1.save();
  //     });
  //     const exec = async () => {
  //       return await request(server)
  //         .delete("/api/suppliers/items/price/me")
  //         .set("x-auth-token", token)
  //         .send({
  //           adminDeletePassword,
  //           supplierDeletePassword,
  //           supplierName,
  //           code,
  //           priceDelIndex,
  //         });
  //     };
  //     it("Should return 200 if all is ok", async () => {
  //       const res = await exec();
  //       expect(res.status).toBe(200);
  //       const valSup = await Supplier.findById(supplier.id);
  //       expect(valSup.items[0].pricing.limited.length).toBe(0);
  //       expect(valSup.items[1].pricing.limited.length).toBe(0);
  //       const valItem = await Item.findById(item1.id);
  //       expect(valItem.suppliers[0].pricing.limited.length).toBe(0);
  //     });
  //     it("Should return 400 if schema is not respected", async () => {
  //       code = undefined;
  //       const res = await exec();
  //       expect(res.status).toBe(400);
  //     });
  //     it("Should return 400 if no valid supplier was provided", async () => {
  //       admin = new User({
  //         name: "admin",
  //         email: "admin@gmail.com",
  //         password: "Aa123456",
  //         account: { isAdmin: true },
  //         meta: { adminDelete: "adminDelete" },
  //       });
  //       const salt = await bcrypt.genSalt(1);
  //       admin.meta.adminDelete = await bcrypt.hash(
  //         admin.meta.adminDelete,
  //         salt
  //       );
  //       await admin.save();
  //       token = admin.generateAuthToken();
  //       supplierName = "Nonexistant";
  //       const res = await exec();
  //       expect(res.status).toBe(400);
  //     });
  //     it("Should return 400 if no valid supplier is linked to user", async () => {
  //       user.meta.supplier = "Invalid";
  //       await user.save();
  //       const res = await exec();
  //       expect(res.status).toBe(400);
  //     });
  //     it("Should return 400 if no valid item was provided", async () => {
  //       code = "00000";
  //       const res = await exec();
  //       expect(res.status).toBe(400);
  //     });
  //     it("Should return 400 if the rebate index is invalid", async () => {
  //       priceDelIndex = 100;
  //       const res = await exec();
  //       expect(res.status).toBe(400);
  //     });
  //     it("Should return 401 if password is incorrect", async () => {
  //       supplierDeletePassword = "wrong";
  //       const res = await exec();
  //       expect(res.status).toBe(401);
  //     });
  //     it("Should return 401 if user is not logged in", async () => {
  //       const res = await request(server).delete(
  //         "/api/suppliers/items/price/me"
  //       );
  //       expect(res.status).toBe(401);
  //     });
  //     it("Should return 403 if user does not have proper auth", async () => {
  //       user.account.isSupplier = false;
  //       await user.save();
  //       const res = await exec();
  //       expect(res.status).toBe(403);
  //     });
  //   });
  // });

  describe("/locations", () => {
    beforeEach(async () => {
      location1 = new Location({ name: "loc1" });
      const loc = await geocoder.geocode("414 E 14th street");
      location1.location = {
        type: "Point",
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
      };
      supplier = new Supplier({
        name: "Supplier",
        locations: [location1.id],
        logo: fs.readFileSync("./tests/test_images/Logo_blank.png"),
      });
      location1.supplier = supplier.id;
      await location1.save();
      await supplier.save();
      supplierId = supplier.id;
    });

    describe("GET /:id", () => {
      const exec = async () => {
        return await request(server).get(
          "/api/suppliers/locations/" + supplierId
        );
      };
      it("Should return 200 and return locations if all is ok", async () => {
        const res = await exec();
        expect(res.body.locations[0].location.formattedAddress).toMatch(
          /10009/
        );
        expect(res.status).toBe(200);
      });
      it("Should return 404 if :id is not an ObjectId", async () => {
        supplierId = "1234";
        const res = await exec();
        expect(res.status).toBe(404);
      });
      it("Should return 404 if supplier does not exist", async () => {
        supplierId = new mongoose.Types.ObjectId();
        const res = await exec();
        expect(res.status).toBe(404);
      });
    });

    describe("POST /me", () => {
      beforeEach(async () => {
        payload = [
          { name: "loc2", address: "412 E 14th street" },
          { name: "loc3", address: "413 E 14th street" },
          { name: "loc4", address: "415 E 14th street" },
        ];
        supplierName = "Supplier";
        supplierAddPassword = "supplierAdd";
        adminAddPassword = "adminAdd";

        user = new User({
          name: "user",
          email: "user@gmail.com",
          password: "Aa123456",
          account: { isSupplier: true },
          meta: {
            supplier: "Supplier",
            supplierAdd: "supplierAdd",
            adminAdd: "adminAdd",
          },
        });
        const salt = await bcrypt.genSalt(1);
        user.meta.supplierAdd = await bcrypt.hash(user.meta.supplierAdd, salt);
        user.meta.adminAdd = await bcrypt.hash(user.meta.adminAdd, salt);
        await user.save();
        token = user.generateAuthToken();
      });
      const exec = async () => {
        return await request(server)
          .post("/api/suppliers/locations/me")
          .set("x-auth-token", token)
          .send({
            supplierName,
            adminAddPassword,
            supplierAddPassword,
            payload,
          });
      };
      it("Should return 201 if locations were all added", async () => {
        const res = await exec();
        expect(res.status).toBe(201);
        const validateSupplier = await Supplier.findById(supplier.id);
        expect(validateSupplier.locations.length).toBe(4);
        const validateLocations = await Location.find();
        expect(validateLocations.length).toBe(4);
      });
      it("Should return 213 if there is a duplicate", async () => {
        payload = [
          { name: "loc2", address: "414 E 14th street" },
          { name: "loc3", address: "413 E 14th street" },
          { name: "loc4", address: "415 E 14th street" },
        ];
        const res = await exec();
        expect(res.status).toBe(213);
        expect(res.body[0].data[0]).toMatchObject({
          name: "loc2",
          address: "414 E 14th street",
        });
      });
      it("Should return 213 if location cannot be found", async () => {
        payload = [
          { name: "loc2", address: "1234" },
          { name: "loc3", address: "413 E 14th street" },
          { name: "loc4", address: "415 E 14th street" },
        ];
        const res = await exec();
        expect(res.status).toBe(213);
        expect(res.body[0].data[0]).toMatchObject({
          name: "loc2",
          address: "1234",
        });
      });
      it("Should return 400 if schema is not respected", async () => {
        const supplierNameCases = [123, [1, 2, 3], true, false];
        for (const testCase of supplierNameCases) {
          supplierName = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        supplierName = "Supplier";

        user.account.isSupplier = false;
        user.account.isAdmin = true;
        await user.save();
        token = user.generateAuthToken();
        const passwordCases = [123, [1, 2, 3], true, false];
        for (const testCase of passwordCases) {
          adminAddPassword = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        adminAddPassword = "adminAdd";
        user.account.isSupplier = true;
        user.account.isAdmin = false;
        await user.save();
        token = user.generateAuthToken();
        for (const testCase of passwordCases) {
          supplierAddPassword = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        supplierAddPassword = "supplierAdd";

        const payloadCases = ["123", 123, true, false];
        for (const testCase of payloadCases) {
          payload = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
      });
      it("Should return 400 if user is not linked to a supplier", async () => {
        user.meta.supplier = "wrong";
        await user.save();
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return 400 if admin did not provide a valid supplier", async () => {
        supplierName = "wrong";
        user.account.isSupplier = false;
        user.account.isAdmin = true;
        await user.save();
        token = user.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return 401 if password is wrong", async () => {
        supplierAddPassword = "wrongPassword";
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it("Should return 401 if user is not logged in", async () => {
        const res = await request(server)
          .post("/api/suppliers/locations/me")
          .send({
            supplierName,
            adminAddPassword,
            supplierAddPassword,
            payload,
          });
        expect(res.status).toBe(401);
      });
      it("Should return 403 if user is not a supplier", async () => {
        user.account.isSupplier = false;
        await user.save();
        token = user.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
    });

    describe("DELETE /me/:id", () => {
      beforeEach(async () => {
        supplierDeletePassword = "supplierDelete";
        adminDeletePassword = "adminDelete";
        supplierName = "supplierName";
        locationId = location1.id;

        user = new User({
          name: "user",
          email: "user@gmail.com",
          password: "Aa123456",
          account: { isSupplier: true },
          meta: {
            supplier: "Supplier",
            supplierDelete: "supplierDelete",
            adminDelete: "adminDelete",
          },
        });
        const salt = await bcrypt.genSalt(1);
        user.meta.supplierDelete = await bcrypt.hash(
          user.meta.supplierDelete,
          salt
        );
        user.meta.adminDelete = await bcrypt.hash(user.meta.adminDelete, salt);
        await user.save();
        token = user.generateAuthToken();
      });

      const exec = async () => {
        return await request(server)
          .delete("/api/suppliers/locations/me/" + locationId)
          .set("x-auth-token", token)
          .send({ supplierDeletePassword, adminDeletePassword, supplierName });
      };

      it("Should return 200 if location was deleted", async () => {
        const res = await exec();
        expect(res.status).toBe(200);
        const validateLocation = await Location.findById(location1.id);
        expect(validateLocation).toBeNull();
        const validateSupplier = await Supplier.findById(supplier.id);
        expect(validateSupplier.locations.length).toBe(0);
      });
      it("Should return 400 if passwords are not strings", async () => {
        const passwordCases = [123, [1, 2, 3], true, false];
        for (const testCase of passwordCases) {
          supplierDeletePassword = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
        supplierDeletePassword = "supplierDelete";
        user.account.isSupplier = false;
        user.account.isAdmin = true;
        await user.save();
        token = user.generateAuthToken();
        for (const testCase of passwordCases) {
          adminDeletePassword = testCase;
          const res = await exec();
          expect(res.status).toBe(400);
        }
      });
      it("Should return 400 if location does not belong to supplier", async () => {
        location2 = new Location({
          name: "loc2",
          supplier: new mongoose.Types.ObjectId(),
        });
        await location2.save();
        locationId = location2.id;
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it("Should return 401 if user is not logged in", async () => {
        const res = await request(server)
          .delete("/api/suppliers/locations/me/" + location1.id)
          .send({ supplierDeletePassword, adminDeletePassword });
        expect(res.status).toBe(401);
      });
      it("Should return 401 if password is wrong", async () => {
        supplierDeletePassword = "wrongPassword";
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it("Should return 403 if user does not have authorization", async () => {
        user.account.isSupplier = false;
        await user.save();
        token = user.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
      it("Should return 404 if :id is not an objectId", async () => {
        locationId = "wrong";
        const res = await exec();
        expect(res.status).toBe(404);
      });
      it("Should return 404 if location does not exist", async () => {
        locationId = new mongoose.Types.ObjectId();
        const res = await exec();
        expect(res.status).toBe(404);
      });
    });
  });
});
