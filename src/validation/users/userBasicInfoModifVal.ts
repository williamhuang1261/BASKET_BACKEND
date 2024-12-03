// Joi validation of body for userBasicInfoModifVal
import Joi from 'joi'

/**
 * Validates user basic information modification request body
 * @param {object} body - Request body
 * @param {string} [body.name] - User's new name
 * @param {string} [body.email] - User's new email
 * @returns {Joi.ValidationResult} - Validation result
 * @see {@link https://joi.dev/api/?v=17.4.0#objectobject-schema} for more information
 */
const userBasicInfoModifVal = (body: any) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(32).optional(),
    email: Joi.string().email().min(3).max(256).optional()
  });
  return schema.validate(body);
};

export default userBasicInfoModifVal;