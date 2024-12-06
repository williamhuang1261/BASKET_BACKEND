import Joi from "joi";
import { allUnitsType } from "../../data/units";

/**
 * Validates user items addition request body
 * @param {object} body - Request body
 * @param {Array<{id: string, select: {method: string, units: string, quantity: number}}>} body.items - Items to add
 * @param {string} body.items[].id - Item ID
 * @param {object} body.items[].select - Item selection details
 * @param {'weight'|'unit'} body.items[].select.method - Selection method
 * @param {string} body.items[].select.units - Units (allUnitsType; from data/units.ts)
 * @param {number} body.items[].select.quantity - Quantity
 * @returns {Joi.ValidationResult} - Validation result
 * @see {@link https://joi.dev/api/?v=17.4.0#arrayitemschema} for more information
 */
const userItemsPostVal = (body:any) => {
  const schema = Joi.object({
    items: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        select: Joi.object({
          method: Joi.string().valid("weight", "unit").required(),
          units: Joi.string().valid(...Array.from(allUnitsType)).required(),
          quantity: Joi.number().positive().min(1).max(16).required()
        }).required()
      })
    ).min(1).required()
  });
  return schema.validate(body);
}

export default userItemsPostVal