const mongoose = require("mongoose");
const Joi = require("joi");
const supplierItemsSchema = require("./supplierItems");

// TODO Add suppliers in MONGODB

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 50,
    unique: true,
  },
  logo: {
    type: Buffer,
    required: true,
  },
  locations: {
    type: Map,
    of: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
    },
  },
  items: {
    type: Map,
    of: supplierItemsSchema,
  },
});

function valSupAdd(user:any) {
  const schema = Joi.object({
    supplierName: Joi.string().min(3).max(50).required(),
    adminAddPassword: Joi.string().required(),
    logo: Joi.binary().required(),
  });
  return schema.validate(user);
}

function valSupGet(user:any) {
  const schema = Joi.object({
    supplierName: Joi.string().required(),
  });
  return schema.validate(user);
}

function valSupPut(user:any) {
  const schema = Joi.object({
    adminUpdatePassword: Joi.string(),
    supplierUpdatePassword: Joi.string(),
    supplierName: Joi.string(),
    name: Joi.string().min(3).max(50),
    logo: Joi.binary(),
  });
  return schema.validate(user);
}

function valSupDel(user:any) {
  const schema = Joi.object({
    adminDeletePassword: Joi.string().required(),
  });
  return schema.validate(user);
}

function valSupAddItem(user:any) {
  const schema = Joi.object({
    supplierAddPassword: Joi.string(),
    adminAddPassword: Joi.string(),
    supplierName: Joi.string(),
    code: Joi.string().required(),
    pricing: Joi.object({
      normal: Joi.number().required(),
      method: Joi.string()
        .valid("unit", "weight_lb", "weight_kg", "weight_100g")
        .required(),
      limited: Joi.object({
        typeOfRebate: Joi.string()
          .valid("buyXgetYatC", "buyXgetYforC", "C")
          .required(),
        X: Joi.number().integer(),
        Y: Joi.number().integer(),
        C: Joi.number().required(),
        rebatePricing: Joi.string()
          .valid("unit", "weight_lb", "weight_kg", "weight_100g")
          .required(),
        start: Joi.date().required(),
        end: Joi.date().required(),
        onlyMembers: Joi.boolean().required(),
      }),
    }).required(),
  });
  return schema.validate(user);
}

function valSupPutItem(user:any) {
  const schema = Joi.object({
    supplierUpdatePassword: Joi.string(),
    adminUpdatePassword: Joi.string(),
    supplierName: Joi.string(),
    code: Joi.string().required(),
    pricing: Joi.object({
      normal: Joi.number(),
      method: Joi.string().valid(
        "unit",
        "weight_lb",
        "weight_kg",
        "weight_100g"
      ),
      limited: Joi.object({
        typeOfRebate: Joi.string()
          .valid("buyXgetYatC", "buyXgetYforC", "C")
          .required(),
        X: Joi.number().integer(),
        Y: Joi.number().integer(),
        C: Joi.number().required(),
        rebatePricing: Joi.string()
          .valid("unit", "weight_lb", "weight_kg", "weight_100g")
          .required(),
        start: Joi.date().required(),
        end: Joi.date().required(),
        onlyMembers: Joi.boolean().required(),
      }),
    }),
  });
  return schema.validate(user);
}

function valSupDelItem(user:any) {
  const schema = Joi.object({
    supplierDeletePassword: Joi.string(),
    adminDeletePassword: Joi.string(),
    supplierName: Joi.string(),
    code: Joi.string().required(),
  });
  return schema.validate(user);
}

function valSupDelItemPrice(user:any) {
  const schema = Joi.object({
    supplierDeletePassword: Joi.string(),
    adminDeletePassword: Joi.string(),
    supplierName: Joi.string(),
    code: Joi.string().required(),
    priceDelIndex: Joi.number().integer().required(),
  });
  return schema.validate(user);
}

const Supplier = mongoose.model("Supplier", supplierSchema);

export default Supplier;
export {valSupAdd, valSupGet, valSupPut, valSupDel, valSupAddItem, valSupPutItem, valSupDelItem, valSupDelItemPrice};