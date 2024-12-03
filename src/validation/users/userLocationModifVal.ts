import Joi from "joi";

/**
 * Validates user location modification request body
 * @param {object} body - Request body
 * @param {string} body.country - Country code
 * @param {'Point'} body.type - GeoJSON type
 * @param {[number, number]} body.coordinates - [longitude, latitude]
 * @param {string} body.formattedAddress - Formatted address string
 * @returns {Joi.ValidationResult} - Validation result
 * @see {@link https://joi.dev/api/?v=17.4.0#objectobject-schema} for more information
 */
const userLocationModifVal = (body: any) => {
  if (body.type || body.coordinates || body.formattedAddress) {
    if (!body.country || !body.coordinates || !body.formattedAddress)
      return { error: { details: [{ message: "Missing required fields" }] } };
  }

  const schema = Joi.object({
    country: Joi.string().min(3).max(32).valid("Canada", "USA").required(),
    type: Joi.string().valid("Point").required(),
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
    formattedAddress: Joi.string().strict().min(3).max(256).required(),
  });
  return schema.validate(body);
};

export default userLocationModifVal;
