const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { joiPasswordExtendCore } = require("joi-password");
const joiPassword = Joi.extend(joiPasswordExtendCore);
const { allUnitsType, distanceUnitsType } = require("./../data/units");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 5,
    maxlength: 320,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 1024,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
    formattedAddress: String,
  },
  account: {
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    isSupplier: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    confCode: String,
    confExp: Date,
  },
  meta: {
    supplier: String,
    supplierAdd: String,
    supplierUpdate: String,
    supplierGet: String,
    supplierDelete: String,
    adminAdd: String,
    adminUpdate: String,
    adminGet: String,
    adminDelete: String,
  },
  membership: [String],
  preferences: {
    weightUnits: String,
    distUnits: String,
    language: {
      type: String,
      enum: ["en", "fr"],
    },
  },
  items: [
    {
      id: mongoose.Schema.Types.ObjectId,
      ref: {
        standard: {
          type: String,
          enum: ["PLU", "UPC", "EAN"]
        },
        code: String
      },
      select: {
        method: {
          type: String,
          enum: ["weight", "unit"]
        },
        units: allUnitsType,
        quantity: Number,
      },
    },
  ],
  filters: {
    searchFilters: {
      distance: {
        amount: Number,
        units: distanceUnitsType,
      },
      categories: [String],
      stores: [String],
    },
    basketFilters: {
      filteredStores: [String],
      maxStores: Number,
    },
  },

  // TODO: Handle new categories
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      isSupplier: this.account.isSupplier,
      isAdmin: this.account.isAdmin,
    },
    config.get("jwtPrivateKey")
  );
  return token;
};

function valUserCreation(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().min(5).max(320).required().email(),
    password: joiPassword
      .string()
      .min(8)
      .max(1024)
      .minOfUppercase(1)
      .minOfLowercase(1)
      .noWhiteSpaces()
      .onlyLatinCharacters()
      .required(),
  });
  return schema.validate(user);
}

function valUserLogging(user) {
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });
  return schema.validate(user);
}

function valUserModif(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30),
    email: Joi.string().min(5).max(320).email(),
    password: joiPassword
      .string()
      .min(8)
      .max(128)
      .minOfUppercase(1)
      .minOfLowercase(1)
      .noWhiteSpaces()
      .onlyLatinCharacters(),
    oldPassword: joiPassword.string().required(),
  });
  return schema.validate(user);
}

function validateUserUpdateByAdmin(user) {
  const schema = Joi.object({
    adminUpdatePassword: Joi.string(),
    name: Joi.string().min(3).max(30),
    email: Joi.string().min(5).max(320).email(),
    password: joiPassword
      .string()
      .min(8)
      .max(128)
      .minOfUppercase(1)
      .minOfLowercase(1)
      .noWhiteSpaces()
      .onlyLatinCharacters(),
    isAdmin: Joi.boolean(),
    isSupplier: Joi.boolean(),
  });
  return schema.validate(user);
}

function valAuthModify(user) {
  const passwordReq = joiPassword
    .string()
    .min(10)
    .max(128)
    .minOfSpecialCharacters(2)
    .minOfLowercase(2)
    .minOfUppercase(2)
    .minOfNumeric(2)
    .noWhiteSpaces();

  const schema = Joi.object({
    supplierAddPassword: Joi.string().required(),
    supplierUpdatePassword: Joi.string().required(),
    supplierDeletePassword: Joi.string().required(),
    supplierGetPassword: Joi.string().required(),
    newSupplierAddPassword: passwordReq,
    newSupplierUpdatePassword: passwordReq,
    newSupplierDeletePassword: passwordReq,
    newSupplierGetPassword: passwordReq,
  });
  return schema.validate(user);
}

function valAuthCreate(user) {
  const passwordReq = joiPassword
    .string()
    .min(10)
    .max(128)
    .minOfSpecialCharacters(2)
    .minOfLowercase(2)
    .minOfUppercase(2)
    .minOfNumeric(2)
    .noWhiteSpaces()
    .required();

  const schema = Joi.object({
    adminAddPassword: Joi.string().required(),
    adminUpdatePassword: Joi.string().required(),
    adminDeletePassword: Joi.string().required(),
    adminGetPassword: Joi.string().required(),
    supplierAddPassword: passwordReq,
    supplierUpdatePassword: passwordReq,
    supplierDeletePassword: passwordReq,
    supplierGetPassword: passwordReq,
    supplierName: Joi.string().required(),
  });
  return schema.validate(user);
}

function valAuthDel(user) {
  const schema = Joi.object({
    adminAddPassword: Joi.string().required(),
    adminUpdatePassword: Joi.string().required(),
    adminDeletePassword: Joi.string().required(),
    adminGetPassword: Joi.string().required(),
  });
  return schema.validate(user);
}

const User = mongoose.model("User", userSchema);
exports.User = User;
exports.valUserCreation = valUserCreation;
exports.valUserLogging = valUserLogging;
exports.valUserModif = valUserModif;
exports.validateUserUpdateByAdmin = validateUserUpdateByAdmin;
exports.valAuthModify = valAuthModify;
exports.valAuthCreate = valAuthCreate;
exports.valAuthDel = valAuthDel;
