import mongoose from "mongoose";

const suppliersPriceSchema = new mongoose.Schema({
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
          enum: ['buyXgetYatC', "buyXgetYforC", "C"],
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
          required: true
        }
    
      }),
    ],
  },
});

const SupplierPrice = mongoose.model("SuppliersPrice", suppliersPriceSchema);

export default SupplierPrice