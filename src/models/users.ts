import mongoose from "mongoose";
import { allUnits, distanceUnits, weightUnits } from "../data/units.js";
import UserProps from "../data/interface/UserProps.js";

const userSchema = new mongoose.Schema<UserProps>({
  uid: {
    type: String,
    required: true,
    unique: true,
    index: true,
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
      enum: Array.from(weightUnits),
      default: "kg",
    },
    distUnits: {
      type: String,
      enum: Array.from(distanceUnits),
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
        enum: Array.from(allUnits),
      },
      quantity: {
        type: Number,
      },
    },
    default: new Map(),
  },

  // Filters info
  filters: {
    searchPreferences: {
      distance: {
        amount: {
          type: Number,
          default: 10,
        },
        units: {
          type: String,
          enum: Array.from(distanceUnits),
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
