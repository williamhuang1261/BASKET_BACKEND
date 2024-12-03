const Joi = require('joi');

/**
 * @description Initializes object ID validation for Joi
 * @example
 * validation();
 */
const validation = () => {
  Joi.objectId = require('joi-objectid')(Joi);
}

export default validation;