// const Joi = require("joi");
// const mongoose = require("mongoose");
// const { allUnitsType } = require("../data/units");
// const categories = require("../data/data");


// // Refactoring because an item may have multiple brands
// const itemSchema = new mongoose.Schema({
//   name: {
//     fr: {
//       type: String,
//       minlength: 3,
//       maxlength: 250,
//       required: true,
//     },
//     en: {
//       type: String,
//       minlength: 3,
//       maxlength: 250,
//       required: true,
//     },
//     size: {
//       type: String,
//       enum: ["S", "M", "L", "XL"],
//     },
//   },
//   ref: {
//     standard: {
//       type: String,
//       enum: ["PLU", "UPC", "EAN"],
//       required: true,
//     },
//     code: {
//       type: String,
//       unique: true,
//       required: true,
//     },
//   },
//   amount: {
//     isApprox: Boolean,
//     meas: {
//       type: String,
//       enum: ["weight", "volume", "unit"],
//     },
//     units: {
//       type: String,
//       enum: allUnitsType,
//     },
//     quantity: Number,
//   },
//   description: {
//     en: String,
//     fr: String
//   },
//   suppliers: [
//     new mongoose.Schema({
//       supplier: {
//         type: String,
//         minLength: 3,
//         maxLength: 50,
//       },
//       pricing: {
//         brand: {
//           type: String,
//           minlength: 1,
//           maxlength: 250,
//         },
//         normal: {
//           type: Number,
//           default: -1.0,
//         },
//         method: {
//           type: String,
//           enum: ["unit", "weight_lb", "weight_kg", "weight_100g"],
//         },
//         limited: [
//           new mongoose.Schema({
//             typeOfRebate: {
//               type: String,
//               enum: ['buyXgetYatC', "buyXgetYforC", "C"],
//             },
//             //#Bought
//             X: Number,
//             //#With rebate
//             Y: Number,
//             //Cost
//             C: Number,
//             rebatePricing: {
//               type: String,
//               enum: ["unit", "weight_lb", "weight_kg", "weight_100g"],
//             },
//             start: {
//               type: Date,
//               required: true,
//             },
//             end: {
//               type: Date,
//               required: true,
//             },
//             onlyMembers: {
//               type: Boolean,
//               required: true
//             }
        
//           }),
//         ],
//       },
//     }),
//   ],
//   categories: [
//     {
//       type: String,
//       enum: categories,
//     },
//   ],
//   image: {
//     type: Buffer,
//     required: true,
//   },
// });



// function valItemCreate(item: any) {
//   const schema = Joi.object({
//     adminAddPassword: Joi.string().required(),
//     name: Joi.object({
//       fr: Joi.string().min(3).max(250).required(),
//       en: Joi.string().min(3).max(250).required(),
//       size: Joi.string().valid("S", "M", "L", "XL").required(),
//     }).required(),
//     ref: Joi.object({
//       standard: Joi.string().valid("PLU", "UPC", "EAN").required(),
//       code: Joi.string()
//         .pattern(/^[0-9]+$/)
//         .required(),
//     }).required(),
//     amount: Joi.object({
//       isApprox: Joi.boolean().required(),
//       meas: Joi.string().valid("weight", "volume", "unit").required(),
//       units: Joi.string()
//         .valid(
//           "mg",
//           "g",
//           "kg",
//           "oz",
//           "lb",
//           "mL",
//           "L",
//           "fl oz",
//           "pint",
//           "quart",
//           "gallon",
//           "unit"
//         )
//         .required(),
//       quantity: Joi.number().required(),
//     }).required(),
//     description: Joi.string(),
//     brand: Joi.string().min(3).max(250).required(),
//     image: Joi.binary().required(),
//   });
//   return schema.validate(item);
// }
// function valItemModif(item:any) {
//   const schema = Joi.object({
//     adminUpdatePassword: Joi.string().required(),
//     name: Joi.object({
//       fr: Joi.string().min(3).max(250),
//       en: Joi.string().min(3).max(250),
//       size: Joi.string().valid("S", "M", "L", "XL"),
//     }),
//     ref: Joi.object({
//       standard: Joi.string().valid("PLU", "UPC", "EAN"),
//       code: Joi.string(),
//     }),
//     amount: Joi.object({
//       isApprox: Joi.boolean(),
//       meas: Joi.string().valid("weight", "volume", "unit"),
//       units: Joi.string().valid(
//         "mg",
//         "g",
//         "kg",
//         "oz",
//         "lb",
//         "mL",
//         "L",
//         "fl oz",
//         "pint",
//         "quart",
//         "gallon",
//         "unit"
//       ),
//       quantity: Joi.number(),
//     }),
//     description: Joi.string(),
//     brand: Joi.string().min(3).max(250),
//     image: Joi.binary(),
//   });
//   return schema.validate(item);
// }
// function valItemDelete(item:any) {
//   const schema = Joi.object({
//     adminDeletePassword: Joi.string().required(),
//   });
//   return schema.validate(item);
// }

// const Item = mongoose.model("Item", itemSchema);
// export default Item
// export { valItemCreate, valItemModif, valItemDelete };
