import mongoose from "mongoose";
import { allUnits } from "../data/units.js";
import categories from "../data/data.js";
import { ItemProps } from "../interface/ItemProps.js";

// Refactoring because an item may have multiple brands
const itemSchema = new mongoose.Schema<ItemProps>({
  name: {
    fr: {
      type: String,
      minlength: 3,
      maxlength: 250,
    },
    en: {
      type: String,
      minlength: 3,
      maxlength: 250,
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
    method: {
      type: String,
      enum: ["weight", "volume", "unit"],
    },
    units: {
      type: String,
      enum: allUnits,
    },
    count: Number,
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
      brand: {
        type: String,
        minlength: 1,
        maxlength: 250,
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
              enum: ["buyXgetYatC", "buyXgetYforC", "C"],
            },
            //#Bought
            X: Number,
            //#With rebate
            Y: Number,
            //Cost
            C: Number,
            method: {
              type: String,
              enum: ["unit", "weight_lb", "weight_kg", "weight_100g"],
            },
            timeframe: {
              start: {
                type: Date,
                required: true,
              },
              end: {
                type: Date,
                required: true,
              },
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
      default: [],
    },
  ],
  image: {
    type: Buffer,
    required: true,
  },
});

const Item = mongoose.model("Item", itemSchema);
export default Item;
