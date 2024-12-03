import {
  allUnitsType,
  distanceUnitsType,
  weightUnitsType,
} from "../data/units";
import mongoose from "mongoose";
import categories from "../data/data";
import UserProps from "../interface/UserProps.js";

const userSchema = new mongoose.Schema<UserProps>({
  // TODO Create an MongoDB index for uid
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  // Basic info
  name: {
    type: String,
    maxlength: 32,
    minlength: 3,
  },
  email: {
    type: String,
    maxlength: 256,
    minlength: 3,
  },

  // Location info
  location: {
    country: {
      type: String,
      default: "Canada",
      enum: ["Canada", "USA"],
      required: true,
    },
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
    formattedAddress: String,
  },

  // Account info
  account: {
    isSupplier: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  supplierInfo: {
    supplier: String,
    supplierAdd: String,
    supplierUpdate: String,
    supplierGet: String,
    supplierDelete: String,
  },
  adminInfo: {
    adminAdd: String,
    adminUpdate: String,
    adminGet: String,
    adminDelete: String,
  },

  // Membership info
  membership: {
    required: true,
    type: Map,
    of: Boolean,
    default: new Map(),
  },

  // Preferences info
  preferences: {
    weightUnits: {
      type: String,
      enum: Array.from(weightUnitsType),
      default: "kg",
    },
    distUnits: {
      type: String,
      enum: Array.from(distanceUnitsType),
      default: "km",
    },
    language: {
      type: String,
      enum: ["en", "fr"],
      default: "en",
    },
  },

  // Items info
  items: {
    type: Map,
    of: {
      method: {
        type: String,
        enum: ["weight", "unit"],
      },
      units: {
        type: String,
        enum: Array.from(allUnitsType),
      },
      quantity: {
        type: Number,
      },
    },
    default: new Map(),
  },

  // Filters info
  filters: {
    searchFilters: {
      distance: {
        amount: {
          type: Number,
          default: 10,
        },
        units: {
          type: String,
          enum: Array.from(distanceUnitsType),
          default: "km",
        },
      },
      categories: {
        type: Map,
        of: Boolean,
        default: new Map(),
      },
      stores: {
        type: Map,
        of: Boolean,
        default: new Map(),
      },
    },
    basketFilters: {
      filteredStores: {
        type: Map,
        of: Boolean,
        default: new Map(),
      },
      maxStores: {
        type: Number,
        default: null,
      },
    },
  },
});

const User = mongoose.model<UserProps>("User", userSchema);
export default User;
