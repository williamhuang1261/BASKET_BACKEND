import Joi from "joi";
import {
  weightUnitsType,
  distanceUnitsType,
  allUnitsType,
} from "../../data/units";

/**
 * Validates the user creation data using Joi schemas.
 *
 * @param {any} user - The user data to validate.
 * @returns {Joi.ValidationResult} The result of the validation.
 *
 * The user data should have the following structure:
 * - uid: string (required)
 * - name: string (optional)
 * - email: string (optional, must be a valid email)
 * - location: object (required)
 *   - country: string (must be "Canada" or "USA")
 *   - type: string (optional, must be "Point")
 *   - coordinates: array of numbers (optional)
 *   - formattedAddress: string (optional)
 * - account: object (required)
 *   - isSupplier: boolean (required)
 *   - isAdmin: boolean (required)
 * - supplierInfo: object (optional)
 *   - supplier: string (required)
 *   - supplierAdd: string (required)
 *   - supplierUpdate: string (required)
 *   - supplierGet: string (required)
 *   - supplierDelete: string (required)
 * - adminInfo: object (optional)
 *   - adminAdd: string (required)
 *   - adminUpdate: string (required)
 *   - adminGet: string (required)
 *   - adminDelete: string (required)
 * - membership: array of strings (required)
 * - preferences: object (required)
 *   - weightUnits: string (required, must be one of the valid weight units)
 *   - distUnits: string (required, must be one of the valid distance units)
 *   - language: string (required, must be "en" or "fr")
 * - items: array of objects (required)
 *   - id: string (required)
 *   - ref: object (required)
 *     - standard: string (required, must be "PLU", "UPC", or "EAN")
 *     - code: string (required)
 *   - select: object (required)
 *     - method: string (required, must be "weight" or "unit")
 *     - units: string (required, must be one of the valid units)
 *     - quantity: number (required)
 * - filters: object (required)
 *   - searchFilters: object (required)
 *     - distance: object (required)
 *       - amount: number (required)
 *       - units: string (required, must be one of the valid distance units)
 *     - categories: array of strings (required)
 *     - stores: array of strings (required)
 *   - basketFilters: object (required)
 *     - filteredStores: array of strings (required)
 *     - maxStores: number (required, can be null)
 */

const userCreationValidation = (user: any) => {
  const locationSchema = Joi.object({
    country: Joi.string().valid("Canada", "USA").required(),
    type: Joi.string().valid("Point").optional(),
    coordinates: Joi.array().items(Joi.number()).optional(),
    formattedAddress: Joi.string().optional(),
  });

  const accountSchema = Joi.object({
    isSupplier: Joi.boolean().required(),
    isAdmin: Joi.boolean().required(),
  });

  const supplierInfoSchema = Joi.object({
    supplier: Joi.string().required(),
    supplierAdd: Joi.string().required(),
    supplierUpdate: Joi.string().required(),
    supplierGet: Joi.string().required(),
    supplierDelete: Joi.string().required(),
  });

  const adminInfoSchema = Joi.object({
    adminAdd: Joi.string().required(),
    adminUpdate: Joi.string().required(),
    adminGet: Joi.string().required(),
    adminDelete: Joi.string().required(),
  });

  const preferencesSchema = Joi.object({
    weightUnits: Joi.string()
      .valid(...Array.from(weightUnitsType))
      .required(),
    distUnits: Joi.string()
      .valid(...Array.from(distanceUnitsType))
      .required(),
    language: Joi.string().valid("en", "fr").required(),
  });

  const itemSchema = Joi.object({
    id: Joi.string().required(),
    ref: Joi.object({
      standard: Joi.string().valid("PLU", "UPC", "EAN").required(),
      code: Joi.string().required(),
    }).required(),
    select: Joi.object({
      method: Joi.string().valid("weight", "unit").required(),
      units: Joi.string()
        .valid(...Array.from(allUnitsType))
        .required(),
      quantity: Joi.number().required(),
    }).required(),
  });

  const searchFiltersSchema = Joi.object({
    distance: Joi.object({
      amount: Joi.number().positive().required(),
      units: Joi.string()
        .valid(...Array.from(distanceUnitsType))
        .required(),
    }).required(),
    categories: Joi.array().items(Joi.string()).required(),
    stores: Joi.array().items(Joi.string()).required(),
  });

  const basketFiltersSchema = Joi.object({
    filteredStores: Joi.array().items(Joi.string()).required(),
    maxStores: Joi.number().allow(null).required(),
  });

  const filtersSchema = Joi.object({
    searchFilters: searchFiltersSchema.required(),
    basketFilters: basketFiltersSchema.required(),
  });

  const userCreationVal = Joi.object({
    uid: Joi.string().required(),
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    location: locationSchema.required(),
    account: accountSchema.required(),
    supplierInfo: supplierInfoSchema.optional(),
    adminInfo: adminInfoSchema.optional(),
    membership: Joi.array().items(Joi.string()).required(),
    preferences: preferencesSchema.required(),
    items: Joi.array().items(itemSchema).required(),
    filters: filtersSchema.required(),
  });

  return userCreationVal.validate(user);
};

export default userCreationValidation;
