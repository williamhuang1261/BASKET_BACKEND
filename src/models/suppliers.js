const mongoose = require("mongoose");
const Joi = require("joi");

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
  locations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
    },
  ],
  items: [
    new mongoose.Schema({
      item: {
        code: {
          type: String,
          required: true,
        },
        id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
      },
      pricing: {
        normal: {
          type: Number,
          default: -1.0,
        },
        method: {
          type: String,
          enum: ["unit", "weight_lb", "weight_kg", "weight_100g"],
        },
        limited: [
          new mongoose.Schema({
            typeOfRebate: {
              type: String,
              enum: ['buyXgetYatC',"buyXgetYforC", "C"],
            },
            //#Bought (Always a number)
            X: Number,
            //#With rebate (Always a number)
            Y: Number,
            //Cost
            C: Number,
            // Pricing format of C value
            rebatePricing: {
              type: String,
              enum: ["unit", "weight_lb", "weight_kg", "weight_100g"],
            },
            start: {
              type: Date,
              required: true,
            },
            end: {
              type: Date,
              required: true,
            },
            onlyMembers: {
              type: Boolean,
              required: true
            }
          }),
        ],
      },
    }),
  ],
});

function valSupAdd(user) {
  const schema = Joi.object({
    supplierName: Joi.string().min(3).max(50).required(),
    adminAddPassword: Joi.string().required(),
    logo: Joi.binary().required(),
  });
  return schema.validate(user);
}

function valSupGet(user) {
  const schema = Joi.object({
    supplierName: Joi.string().required(),
  });
  return schema.validate(user);
}

function valSupPut(user) {
  const schema = Joi.object({
    adminUpdatePassword: Joi.string(),
    supplierUpdatePassword: Joi.string(),
    supplierName: Joi.string(),
    name: Joi.string().min(3).max(50),
    logo: Joi.binary(),
  });
  return schema.validate(user);
}

function valSupDel(user) {
  const schema = Joi.object({
    adminDeletePassword: Joi.string().required(),
  });
  return schema.validate(user);
}

function valSupAddItem(user) {
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
          .valid('buyXgetYatC', "buyXgetYforC", "C")
          .required(),
        X: Joi.number().integer(),
        Y: Joi.number().integer(),
        C: Joi.number().required(),
        rebatePricing: Joi.string().valid(
          "unit",
          "weight_lb",
          "weight_kg",
          "weight_100g"
        ).required(),
        start: Joi.date().required(),
        end: Joi.date().required(),
        onlyMembers: Joi.boolean().required()
      }),
    }).required(),
  });
  return schema.validate(user);
}

function valSupPutItem(user) {
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
          .valid('buyXgetYatC', "buyXgetYforC", "C")
          .required(),
        X: Joi.number().integer(),
        Y: Joi.number().integer(),
        C: Joi.number().required(),
        rebatePricing: Joi.string().valid(
          "unit",
          "weight_lb",
          "weight_kg",
          "weight_100g"
        ).required(),
        start: Joi.date().required(),
        end: Joi.date().required(),
        onlyMembers: Joi.boolean().required()
      }),
    }),
  });
  return schema.validate(user);
}

function valSupDelItem(user) {
  const schema = Joi.object({
    supplierDeletePassword: Joi.string(),
    adminDeletePassword: Joi.string(),
    supplierName: Joi.string(),
    code: Joi.string().required(),
  });
  return schema.validate(user);
}

function valSupDelItemPrice(user) {
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
exports.Supplier = Supplier;

exports.valSupAdd = valSupAdd;
exports.valSupGet = valSupGet;
exports.valSupPut = valSupPut;
exports.valSupDel = valSupDel;

exports.valSupAddItem = valSupAddItem;
exports.valSupPutItem = valSupPutItem;
exports.valSupDelItem = valSupDelItem;
exports.valSupDelItemPrice = valSupDelItemPrice;
