import Joi from "joi";

/**
 * Validates user items deletion request body
 * @param {object} body - Request body
 * @param {string[]} body.items - Array of item IDs to remove
 * @returns {Joi.ValidationResult} - Validation result
 * @see {@link https://joi.dev/api/?v=17.4.0#arrayitemschema} for more information
 */
const userItemsDelVal = (body: any) => {
  const schema = Joi.object({
    items: Joi.array().items(Joi.string()).required()
  });
  return schema.validate(body);
}

export default userItemsDelVal