import mongoose from "mongoose";
import { allUnitsType } from "../data/units";
import categories from "../data/data";

// Refactoring because an item may have multiple brands
const itemSchema = new mongoose.Schema({
  name: {
    fr: {
      type: String,
      minlength: 3,
      maxlength: 250,
      required: true,
    },
    en: {
      type: String,
      minlength: 3,
      maxlength: 250,
      required: true,
    },
    size: {
      type: String,
      enum: ["S", "M", "L", "XL"],
    },
  },
  ref: {
    standard: {
      type: String,
      enum: ["PLU", "UPC", "EAN"],
      required: true,
    },
    code: {
      type: String,
      unique: true,
      required: true,
    },
  },
  amount: {
    isApprox: Boolean,
    meas: {
      type: String,
      enum: ["weight", "volume", "unit"],
    },
    units: {
      type: String,
      enum: allUnitsType,
    },
    quantity: Number,
  },
  description: {
    en: String,
    fr: String,
  },
  suppliers: [
    new mongoose.Schema({
      supplier: {
        type: String,
        minLength: 3,
        maxLength: 50,
      },
      pricing: {
        brand: {
          type: String,
          minlength: 1,
          maxlength: 250,
        },
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
              enum: ["buyXgetYatC", "buyXgetYforC", "C"],
            },
            //#Bought
            X: Number,
            //#With rebate
            Y: Number,
            //Cost
            C: Number,
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
              required: true,
            },
          }),
        ],
      },
    }),
  ],
  categories: [
    {
      type: String,
      enum: categories,
    },
  ],
  image: {
    type: Buffer,
    required: true,
  },
});

const Item = mongoose.model("Item", itemSchema);
export default Item
