import mongoose from "mongoose";
import {
  valBasketFiltersFilteredStoresAdd,
  valBasketFiltersFilteredStoresRemove,
  valBasketFiltersMaxStores,
  valEmail,
  valItemsAdd,
  valItemsRemove,
  valItemsUpdate,
  valLocation,
  valMembershipAdd,
  valMembershipRemove,
  valName,
  valPreferences,
  valSearchPreferencesCategoriesAdd,
  valSearchPreferencesCategoriesRemove,
  valSearchPreferencesDistance,
  valSearchPreferencesStoresAdd,
  valSearchPreferencesStoresRemove,
} from "../../../../src/validation/users/userInfoPutVal";

describe("userInfoPutValidation", () => {

  describe("valName", () => {
    let values: any;
    beforeEach(() => {
      values = "John Doe";
    });
    const exec = () => {
      return valName(values);
    };
    it("Should return an error if name is less than 3 characters", () => {
      values = "Jo";
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if name is more than 32 characters", () => {
      // Array of length 34, so that the string is 33 characters long
      values = new Array(34).join("a");
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if name is not a string", () => {
      values = 123;
      let res = exec();
      expect(res.error).toBeDefined();

      values = true;
      res = exec();
      expect(res.error).toBeDefined();

      values = { a: "a", b: "b", c: "c" };
      res = exec();
      expect(res.error).toBeDefined();

      values = ["a", "b", "c"];
      res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if nothing was provided", () => {
      values = undefined;
      const res = exec();
      expect(res.error).toBeDefined();
    });
  });

  describe("valEmail", () => {
    let values: any;
    beforeEach(() => {
      values = "email@gmail.com";
    });
    const exec = () => {
      return valEmail(values);
    };
    it("Should return an error if email is less than 3 characters", () => {
      values = "a@";
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Shoul return an error if email is more than 256 characters", () => {
      // Array of length 258, so that the string is 257 characters long
      values = Array(258).join("a") + "@gmail.com";
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if email is not a valid email format", () => {
      values = "email.com";
      let res = exec();
      expect(res.error).toBeDefined();

      values = "email@com";
      res = exec();
      expect(res.error).toBeDefined();

      values = "email.com";
      res = exec();
      expect(res.error).toBeDefined();

      values = "email@.com";
      res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if email is not a string", () => {
      values = 123;
      let res = exec();
      expect(res.error).toBeDefined();

      values = true;
      res = exec();
      expect(res.error).toBeDefined();

      values = { a: "a", b: "b", c: "c" };
      res = exec();
      expect(res.error).toBeDefined();

      values = ["a", "b", "c"];
      res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if nothing was provided", () => {
      values = undefined;
      const res = exec();
      expect(res.error).toBeDefined();
    });
  });

  describe("valLocation", () => {
    let values: any;
    beforeEach(() => {
      values = {
        country: "Canada",
        type: "Point",
        coordinates: [45.5017, -73.5673],
        formattedAddress: "123 Test St",
      };
    });
    const exec = () => {
      return valLocation(values);
    };
    it("Should return an error if type/coordinates/formattedAddress is not provided together", () => {
      values.type = undefined;
      let res = exec();
      expect(res.error).toBeDefined();
      values.type = "Point";

      values.coordinates = undefined;
      res = exec();
      expect(res.error).toBeDefined();
      values.coordinates = [45.5017, -73.5673];

      values.formattedAddress = undefined;
      res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if country is not "Canada" or "USA"', () => {
      values.country = "Mexico";
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if country is not a string", () => {
      values.country = 123;
      let res = exec();
      expect(res.error).toBeDefined();

      values.country = true;
      res = exec();
      expect(res.error).toBeDefined();

      values.country = { a: "a", b: "b", c: "c" };
      res = exec();
      expect(res.error).toBeDefined();

      values.country = ["a", "b", "c"];
      res = exec();
      expect(res.error).toBeDefined;
    });
    it("Should return an error if country was not provided", () => {
      values.country = undefined;
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if country is more than 64 characters", () => {
      // Array of length 66, so that the string is 65 characters long
      values.country = Array(66).join("a");
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if type is not "Point"', () => {
      values.type = "Polygon";
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if type is not a string", () => {
      values.type = 123;
      let res = exec();
      expect(res.error).toBeDefined();

      values.type = true;
      res = exec();
      expect(res.error).toBeDefined();

      values.type = { a: "a", b: "b", c: "c" };
      res = exec();
      expect(res.error).toBeDefined();

      values.type = ["a", "b", "c"];
      res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if coordinates is not an array of numbers", () => {
      values.coordinates[1] = "a";
      let res = exec();
      expect(res.error).toBeDefined();

      values.coordinates[1] = true;
      res = exec();
      expect(res.error).toBeDefined();

      values.coordinates[1] = { a: "a", b: "b", c: "c" };
      res = exec();
      expect(res.error).toBeDefined();

      values.coordinates[1] = ["a", "b", "c"];
      res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if coordinates is not an array of length 2", () => {
      values.coordinates = [45.5017];
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if formattedAddress is more than 256 characters", () => {
      // Array of length 258, so that the string is 257 characters long
      values.formattedAddress = Array(258).join("a");
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if formattedAddress is not a string", () => {
      values.formattedAddress = 123;
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if nothing was provided", () => {
      values = undefined;
      const res = exec();
      expect(res.error).toBeDefined();
    });
  });

  describe("valMembershipAdd", () => {
    let values: any;
    let currNum: number;
    beforeEach(() => {
      values = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      currNum = 0;
    });
    const exec = () => {
      return valMembershipAdd(values, currNum);
    };
    it("Should return an error if the number of total memberships exceeds 32", () => {
      currNum = 31;
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if the number of memberships provided exceeds 32", () => {
      values = new Array(34).fill(new mongoose.Types.ObjectId());
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if the values are not an array of strings", () => {
      values = [123, 456];
      let res = exec();
      expect(res.error).toBeDefined();

      values = [true, false];
      res = exec();
      expect(res.error).toBeDefined();

      values = [{ a: "a" }, { b: "b" }];
      res = exec();
      expect(res.error).toBeDefined();

      values = [["a"], ["b"]];
      res = exec();
      expect(res.error).toBeDefined();

      values = [undefined, undefined];
      res = exec();
      expect(res.error).toBeDefined();

      values = [null, null];
      res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if strings are longer than 32 characters", () => {
      values = [new Array(34).join("a"), new Array(34).join("b")];
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if nothing was provided", () => {
      values = undefined;
      const res = exec();
      expect(res.error).toBeDefined();
    });
  });

  describe("valMembershipRemove", () => {
    let values: any;
    beforeEach(() => {
      values = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
    });
    const exec = () => {
      return valMembershipRemove(values);
    };
    it("Should return an error if the number of memberships exceeds 32", () => {
      values = new Array(33).fill(new mongoose.Types.ObjectId());
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if string length is more than 32 characters", () => {
      values = [new Array(34).join("a"), new Array(34).join("b")];
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if the values are not an array of strings", () => {
      values = [123, 456];
      let res = exec();
      expect(res.error).toBeDefined();

      values = [true, false];
      res = exec();
      expect(res.error).toBeDefined();

      values = [{ a: "a" }, { b: "b" }];
      res = exec();
      expect(res.error).toBeDefined();

      values = [["a"], ["b"]];
      res = exec();
      expect(res.error).toBeDefined();

      values = [undefined, undefined];
      res = exec();
      expect(res.error).toBeDefined();

      values = [null, null];
      res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if nothing was provided", () => {
      values = undefined;
      const res = exec();
      expect(res.error).toBeDefined();
    });
  });

  describe("valPreferences", () => {
    let values: any;
    beforeEach(() => {
      values = {
        weightUnits: "kg",
        distUnits: "km",
        language: "en",
      };
    });
    const exec = () => {
      return valPreferences(values);
    };
    it("Should return an error if weightUnits is invalid", () => {
      values.weightUnits = "invalid";
      let res = exec();
      expect(res.error).toBeDefined();

      values.weightUnits = 123;
      res = exec();
      expect(res.error).toBeDefined();

      values.weightUnits = true;
      res = exec();
      expect(res.error).toBeDefined();

      values.weightUnits = ["kg"];
      res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if distUnits is invalid", () => {
      values.distUnits = "invalid";
      let res = exec();
      expect(res.error).toBeDefined();

      values.distUnits = 123;
      res = exec();
      expect(res.error).toBeDefined();

      values.distUnits = true;
      res = exec();
      expect(res.error).toBeDefined();

      values.distUnits = ["km"];
      res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if language is invalid", () => {
      values.language = "es";
      let res = exec();
      expect(res.error).toBeDefined();

      values.language = 123;
      res = exec();
      expect(res.error).toBeDefined();

      values.language = true;
      res = exec();
      expect(res.error).toBeDefined();

      values.language = ["en"];
      res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should not return an error if optional fields are missing", () => {
      values.weightUnits = undefined;
      let res = exec();
      expect(res.error).toBeUndefined();
      values.weightUnits = "kg";

      values.distUnits = undefined;
      res = exec();
      expect(res.error).toBeUndefined();
      values.distUnits = "km";

      values.language = undefined;
      res = exec();
      expect(res.error).toBeUndefined();
    });
    it("Should return an error if nothing was provided", () => {
      values = undefined;
      const res = exec();
      expect(res.error).toBeDefined();
    });
  });

  describe("valItemsAdd", () => {
    let values: any;
    let currNum: number
    beforeEach(() => {
      values = [
        {
          id: new mongoose.Types.ObjectId(),
          select: {
            method: "weight",
            units: "kg",
            quantity: 1,
          },
        },
        {
          id: new mongoose.Types.ObjectId(),
          select: {
            method: "unit",
            units: "item",
            quantity: 1,
          },
        },
      ];
      currNum = 0;
    });
    const exec = () => {
      return valItemsAdd(values, currNum);
    };
    it('Should return an error if more than 32 items are provided', () => {
      values = new Array(34).fill({
        id: new mongoose.Types.ObjectId(),
        select: {
          method: "weight",
          units: "kg",
          quantity: 1,
        },
      });
      let res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if the total number of items exceeds 32', () => {
      currNum = 31;
      let res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if id is not a string', () => {
      values[0].id = 123;
      let res = exec();
      expect(res.error).toBeDefined();

      values[0].id = true;
      res = exec();
      expect(res.error).toBeDefined();

      values[0].id = { a: "a" };
      res = exec();
      expect(res.error).toBeDefined();

      values[0].id = ["a"];
      res = exec();
      expect(res.error).toBeDefined();

      values[0].id = undefined;
      res = exec();
      expect(res.error).toBeDefined();

      values[0].id = null;
      res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if id is more than 32 characters', () => {
      values[0].id = new Array(34).join("a");
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if select.method is invalid', () => {
      values[0].select.method = "invalid";
      let res = exec();
      expect(res.error).toBeDefined();

      values[0].select.method = 123;
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.method = true;
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.method = ["weight"];
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.method = undefined
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.method = null;
      res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if select.units is invalid', () => {
      values[0].select.units = "invalid";
      let res = exec();
      expect(res.error).toBeDefined();

      values[0].select.units = 123;
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.units = true;
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.units = ["kg"];
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.units = undefined
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.units = null;
      res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if select.quantity is invalid', () => {
      values[0].select.quantity = "invalid";
      let res = exec();
      expect(res.error).toBeDefined();

      values[0].select.quantity = 0
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.quantity = -1;
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.quantity = true;
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.quantity = ["kg"];
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.quantity = undefined
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.quantity = null;
      res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if items is not an array', () => {
      values = 123;
      let res = exec();
      expect(res.error).toBeDefined();

      values = true;
      res = exec();
      expect(res.error).toBeDefined();

      values = { a: "a" };
      res = exec();
      expect(res.error).toBeDefined();

      values = "a";
      res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if items length is more than 32', () => {
      values = new Array(34).fill({
        id: new mongoose.Types.ObjectId(),
        select: {
          method: "weight",
          units: "kg",
          quantity: 1,
        },
      });
      let res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if nothing was provided', () => {
      values = undefined;
      let res = exec();
      expect(res.error).toBeDefined();
    });
  });

  describe("valItemsRemove", () => {
    let values: any;
    beforeEach(() => {
      values = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
    });
    const exec = () => {
      return valItemsRemove(values);
    };
    it("Should return an error if the number of items exceeds 32", () => {
      values = new Array(33).fill(new mongoose.Types.ObjectId());
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if string length is more than 32 characters", () => {
      values = [new Array(34).join("a"), new Array(34).join("b")];
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if the values are not an array of strings", () => {
      values = [123, 456];
      let res = exec();
      expect(res.error).toBeDefined();

      values = [true, false];
      res = exec();
      expect(res.error).toBeDefined();

      values = [{ a: "a" }, { b: "b" }];
      res = exec();
      expect(res.error).toBeDefined();

      values = [["a"], ["b"]];
      res = exec();
      expect(res.error).toBeDefined();

      values = [undefined, undefined];
      res = exec();
      expect(res.error).toBeDefined();

      values = [null, null];
      res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if nothing was provided", () => {
      values = undefined;
      const res = exec();
      expect(res.error).toBeDefined();
    });
  });

  describe("valItemsUpdate", () => {
    let values: any;
    beforeEach(() => {
      values = [
        {
          id: new mongoose.Types.ObjectId(),
          select: {
            method: "weight",
            units: "kg",
            quantity: 1,
          },
        },
        {
          id: new mongoose.Types.ObjectId(),
          select: {
            method: "unit",
            units: "item",
            quantity: 1,
          },
        },
      ];
    });
    const exec = () => {
      return valItemsUpdate(values);
    };
    it('Should return an error if more than 32 items are provided', () => {
      values = new Array(34).fill({
        id: new mongoose.Types.ObjectId(),
        select: {
          method: "weight",
          units: "kg",
          quantity: 1,
        },
      });
      let res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if id is not a string', () => {
      values[0].id = 123;
      let res = exec();
      expect(res.error).toBeDefined();

      values[0].id = true;
      res = exec();
      expect(res.error).toBeDefined();

      values[0].id = { a: "a" };
      res = exec();
      expect(res.error).toBeDefined();

      values[0].id = ["a"];
      res = exec();
      expect(res.error).toBeDefined();

      values[0].id = undefined;
      res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if id is more than 32 characters', () => {
      values[0].id = new Array(34).join("a");
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if select.method is invalid', () => {
      values[0].select.method = "invalid";
      let res = exec();
      expect(res.error).toBeDefined();

      values[0].select.method = 123;
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.method = true;
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.method = ["weight"];
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.method = undefined
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.method = null;
      res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if select.units is invalid', () => {
      values[0].select.units = "invalid";
      let res = exec();
      expect(res.error).toBeDefined();

      values[0].select.units = 123;
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.units = true;
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.units = ["kg"];
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.units = undefined
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.units = null;
      res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if select.quantity is invalid', () => {
      values[0].select.quantity = "invalid";
      let res = exec();
      expect(res.error).toBeDefined();

      values[0].select.quantity = -1;
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.quantity = true;
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.quantity = ["kg"];
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.quantity = undefined
      res = exec();
      expect(res.error).toBeDefined();

      values[0].select.quantity = null;
      res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if items is not an array', () => {
      values = 123;
      let res = exec();
      expect(res.error).toBeDefined();

      values = true;
      res = exec();
      expect(res.error).toBeDefined();

      values = { a: "a" };
      res = exec();
      expect(res.error).toBeDefined();

      values = "a";
      res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if items length is more than 32', () => {
      values = new Array(34).fill({
        id: new mongoose.Types.ObjectId(),
        select: {
          method: "weight",
          units: "kg",
          quantity: 1,
        },
      });
      let res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if nothing was provided', () => {
      values = undefined;
      let res = exec();
      expect(res.error).toBeDefined();
    });
  });

  describe('valSearchPreferencesDistance', () => {
    let values:any;
    beforeEach(() => {
      values = {
        amount: 10,
        units: "km",
      };
    });
    const exec = () => {
      return valSearchPreferencesDistance(values);
    }
    it('Should return an error if amount is invalid', () => {
      values.amount = "invalid";
      let res = exec();
      expect(res.error).toBeDefined();

      values.amount = 0;
      res = exec();
      expect(res.error).toBeDefined();

      values.amount = -1;
      res = exec();
      expect(res.error).toBeDefined();

      values.amount = true;
      res = exec();
      expect(res.error).toBeDefined();

      values.amount = ["1"];
      res = exec();
      expect(res.error).toBeDefined();

      values.amount = undefined;
      res = exec();
      expect(res.error).toBeDefined();

      values.amount = null;
      res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if units is invalid', () => {
      values.units = "invalid";
      let res = exec();
      expect(res.error).toBeDefined();

      values.units = 123;
      res = exec();
      expect(res.error).toBeDefined();

      values.units = true;
      res = exec();
      expect(res.error).toBeDefined();

      values.units = ["km"];
      res = exec();
      expect(res.error).toBeDefined();

      values.units = undefined;
      res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if nothing was provided', () => {
      values = undefined;
      let res = exec();
      expect(res.error).toBeDefined();
    });
  });

  describe('valSearchPreferencesCategoriesAdd', () => {
    let values: any;
    let currNum: number;
    beforeEach(() => {
      values = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      currNum = 0;
    });
    const exec = () => {
      return valSearchPreferencesCategoriesAdd(values, currNum);
    };
    it("Should return an error if the number of provided categories exceeds 32", () => {
      values = new Array(33).fill(new mongoose.Types.ObjectId());
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if the number of total categories exceeds 32", () => {
      currNum = 31;
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if string length is more than 32 characters", () => {
      values = [new Array(34).join("a"), new Array(34).join("b")];
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if the values are not an array of strings", () => {
      values = [123, 456];
      let res = exec();
      expect(res.error).toBeDefined();

      values = [true, false];
      res = exec();
      expect(res.error).toBeDefined();

      values = [{ a: "a" }, { b: "b" }];
      res = exec();
      expect(res.error).toBeDefined();

      values = [["a"], ["b"]];
      res = exec();
      expect(res.error).toBeDefined();

      values = [undefined, undefined]
      res = exec();
      expect(res.error).toBeDefined();

      values = [null, null];
      res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if nothing was provided", () => {
      values = undefined;
      const res = exec();
      expect(res.error).toBeDefined();
    });
  });

  describe('valSearchPreferencesCategoriesRemove', () => {
    let values:any;
    beforeEach(() => {
      values = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
    });
    const exec = () => {
      return valSearchPreferencesCategoriesRemove(values);
    };
    it('Should return an error if the number of categories exceeds 32', () => {
      values = new Array(33).fill(new mongoose.Types.ObjectId());
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if string length is more than 32 characters', () => {
      values = [new Array(34).join("a"), new Array(34).join("b")];
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if the values are not an array of strings', () => {
      values = [123, 456];
      let res = exec();
      expect(res.error).toBeDefined();

      values = [true, false];
      res = exec();
      expect(res.error).toBeDefined();

      values = [{ a: "a" }, { b: "b" }];
      res = exec();
      expect(res.error).toBeDefined();

      values = [["a"], ["b"]];
      res = exec();
      expect(res.error).toBeDefined();

      values = [undefined, undefined];
      res = exec();
      expect(res.error).toBeDefined();

      values = [null, null];
      res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if nothing was provided', () => {
      values = undefined;
      const res = exec();
      expect(res.error).toBeDefined();
    });
  });

  describe('valSearchPreferencesStoresAdd', () => {
    let values: any;
    let currNum: number;
    beforeEach(() => {
      values = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      currNum = 0;
    });
    const exec = () => {
      return valSearchPreferencesStoresAdd(values, currNum);
    };
    it("Should return an error if the number of provided stores exceeds 32", () => {
      values = new Array(33).fill(new mongoose.Types.ObjectId());
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if the number of total stores exceeds 32", () => {
      currNum = 31;
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if string length is more than 32 characters", () => {
      values = [new Array(34).join("a"), new Array(34).join("b")];
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if the values are not an array of strings", () => {
      values = [123, 456];
      let res = exec();
      expect(res.error).toBeDefined();

      values = [true, false];
      res = exec();
      expect(res.error).toBeDefined();

      values = [{ a: "a" }, { b: "b" }];
      res = exec();
      expect(res.error).toBeDefined();

      values = [["a"], ["b"]];
      res = exec();
      expect(res.error).toBeDefined();

      values = [undefined, undefined]
      res = exec();
      expect(res.error).toBeDefined();

      values = [null, null];
      res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if nothing was provided", () => {
      values = undefined;
      const res = exec();
      expect(res.error).toBeDefined();
    });
  });

  describe('valSearchPreferencesStoresRemove', () => {
    let values:any;
    beforeEach(() => {
      values = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
    });
    const exec = () => {
      return valSearchPreferencesStoresRemove(values);
    };
    it('Should return an error if the number of stores exceeds 32', () => {
      values = new Array(33).fill(new mongoose.Types.ObjectId());
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if string length is more than 32 characters', () => {
      values = [new Array(34).join("a"), new Array(34).join("b")];
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if the values are not an array of strings', () => {
      values = [123, 456];
      let res = exec();
      expect(res.error).toBeDefined();

      values = [true, false];
      res = exec();
      expect(res.error).toBeDefined();

      values = [{ a: "a" }, { b: "b" }];
      res = exec();
      expect(res.error).toBeDefined();

      values = [["a"], ["b"]];
      res = exec();
      expect(res.error).toBeDefined();

      values = [undefined, undefined];
      res = exec();
      expect(res.error).toBeDefined();

      values = [null, null];
      res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if nothing was provided', () => {
      values = undefined;
      const res = exec();
      expect(res.error).toBeDefined();
    });
  });

  describe('valBasketFiltersFilteredStoresAdd', () => {
    let values: any;
    let currNum: number;
    beforeEach(() => {
      values = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      currNum = 0;
    });
    const exec = () => {
      return valBasketFiltersFilteredStoresAdd(values, currNum);
    };
    it("Should return an error if the number of provided stores exceeds 32", () => {
      values = new Array(33).fill(new mongoose.Types.ObjectId());
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if the number of total stores exceeds 32", () => {
      currNum = 31;
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if string length is more than 32 characters", () => {
      values = [new Array(34).join("a"), new Array(34).join("b")];
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if the values are not an array of strings", () => {
      values = [123, 456];
      let res = exec();
      expect(res.error).toBeDefined();

      values = [true, false];
      res = exec();
      expect(res.error).toBeDefined();

      values = [{ a: "a" }, { b: "b" }];
      res = exec();
      expect(res.error).toBeDefined();

      values = [["a"], ["b"]];
      res = exec();
      expect(res.error).toBeDefined();

      values = [undefined, undefined]
      res = exec();
      expect(res.error).toBeDefined();

      values = [null, null];
      res = exec();
      expect(res.error).toBeDefined();
    });
    it("Should return an error if nothing was provided", () => {
      values = undefined;
      const res = exec();
      expect(res.error).toBeDefined();
    });
  });

  describe('valBasketFiltersFilteredStoresRemove', () => {
    let values:any;
    beforeEach(() => {
      values = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
    });
    const exec = () => {
      return valBasketFiltersFilteredStoresRemove(values);
    };
    it('Should return an error if the number of stores exceeds 32', () => {
      values = new Array(33).fill(new mongoose.Types.ObjectId());
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if string length is more than 32 characters', () => {
      values = [new Array(34).join("a"), new Array(34).join("b")];
      const res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if the values are not an array of strings', () => {
      values = [123, 456];
      let res = exec();
      expect(res.error).toBeDefined();

      values = [true, false];
      res = exec();
      expect(res.error).toBeDefined();

      values = [{ a: "a" }, { b: "b" }];
      res = exec();
      expect(res.error).toBeDefined();

      values = [["a"], ["b"]];
      res = exec();
      expect(res.error).toBeDefined();

      values = [undefined, undefined];
      res = exec();
      expect(res.error).toBeDefined();

      values = [null, null];
      res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should return an error if nothing was provided', () => {
      values = undefined;
      const res = exec();
      expect(res.error).toBeDefined();
    });
  });

  describe('valBasketFiltersMaxStores', () => {
    let values: any;
    beforeEach(() => {
      values = 10;
    });
    const exec = () => {
      return valBasketFiltersMaxStores(values);
    };
    it('Should return an error if amount is invalid', () => {
      values = "invalid";
      let res = exec();
      expect(res.error).toBeDefined();

      values = 0;
      res = exec();
      expect(res.error).toBeDefined();

      values = -1;
      res = exec();
      expect(res.error).toBeDefined();

      values = true;
      res = exec();
      expect(res.error).toBeDefined();

      values = ["1"];
      res = exec();
      expect(res.error).toBeDefined();

      values = undefined;
      res = exec();
      expect(res.error).toBeDefined();
    });
    it('Should not return an error if value is null', () => {
      values = null;
      let res = exec();
      expect(res.error).toBeUndefined();
    });
    it('Should return an error if nothing was provided', () => {
      values = undefined;
      let res = exec();
      expect(res.error).toBeDefined();
    });
  });
});
