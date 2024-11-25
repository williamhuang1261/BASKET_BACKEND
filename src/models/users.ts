import { allUnitsType, distanceUnitsType } from "../data/units.js";
import mongoose from "mongoose";
import categories from "../data/data.js";
import UserProps from "../interface/UserProps.js";

//TODO Change according to new oauth implementation
// TODO Total refactoring of user schema
const userSchema = new mongoose.Schema<UserProps>({
  // TODO Create an MongoDB index for uid
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  email: String,
  location: {
    required: true,
    type: {
      country: {
        type: String,
        required: true,
        default: "Canada",
        enum: ["Canada", "USA"],
      },
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
  },
  account: {
    type: {
      isSupplier: {
        type: Boolean,
        default: false,
      },
      isAdmin: {
        type: Boolean,
        default: false,
      },
    },
    required: true,
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
  membership: {
    type: [String],
    required: true,
  },
  preferences: {
    type: {
      weightUnits: String,
      distUnits: String,
      language: {
        type: String,
        enum: ["en", "fr"],
      },
    },
    required: true,
  },
  items: {
    required: true,
    type: [
      {
        id: mongoose.Schema.Types.ObjectId,
        ref: {
          standard: {
            type: String,
            enum: ["PLU", "UPC", "EAN"],
          },
          code: String,
        },
        select: {
          method: {
            type: String,
            enum: ["weight", "unit"],
          },
          units: allUnitsType,
          quantity: Number,
        },
      },
    ],
  },
  filters: {
    type: {
      searchFilters: {
        required: true,
        distance: {
          required: true,
          amount: Number,
          units: distanceUnitsType,
        },
        categories: {
          type: [String],
          required: true,
          enum: categories,
        },
        stores: {
          type: [String],
          required: true,
        },
      },
      basketFilters: {
        required: true,
        filteredStores: {
          type: [String],
          required: true,
        },
        maxStores: {
          type: Number,
          required: true,
        },
      },
    },
    required: true,
  },
});

const User = mongoose.model<UserProps>("User", userSchema);

export default User;
