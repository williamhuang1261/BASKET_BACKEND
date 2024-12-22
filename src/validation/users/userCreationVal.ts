import Joi from "joi";
import {
  weightUnitsType,
  distanceUnitsType,
  allUnitsType,
} from "../../data/units.js";

/**
 * Validates the user creation data using Joi schemas.
 *
 * @param {any} user - The user data to validate.
 * @returns {Joi.ValidationResult} The result of the validation.
 * @example
 * The user data should have the following structure:
 * - uid: string (required)
 * - name: string (optional, 3-32 chars)
 * - email: string (optional, 3-256 chars, must be valid email)
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
 * - membership: Map<string, true> (required)
 * - preferences: object (required)
 *   - weightUnits: string (required, must be one of the valid weight units)
 *   - distUnits: string (required, must be one of the valid distance units)
 *   - language: string (required, must be "en" or "fr")
 * - items: Map<string, object> (required)
 *   - method: string (required, must be "weight" or "unit")
 *   - units: string (required, must be one of the valid units)
 *   - quantity: number (required)
 * - filters: object (required)
 *   - searchPreferences: object (required)
 *     - distance: object (required)
 *       - amount: number (required)
 *       - units: string (required, must be one of the valid distance units)
 *     - categories: Map<string, true> (required)
 *     - stores: Map<string, true> (required)
 *   - basketFilters: object (required)
 *     - filteredStores: Map<string, true> (required)
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
    method: Joi.string().valid("weight", "unit").required(),
    units: Joi.string()
      .valid(...Array.from(allUnitsType))
      .required(),
    quantity: Joi.number().required(),
  });

  const searchFiltersSchema = Joi.object({
    distance: Joi.object({
      amount: Joi.number().positive().required(),
      units: Joi.string()
        .valid(...Array.from(distanceUnitsType))
        .required(),
    }).required(),
    categories: Joi.object()
      .pattern(Joi.string(), Joi.boolean().valid(true))
      .required(),
    stores: Joi.object()
      .pattern(Joi.string(), Joi.boolean().valid(true))
      .required(),
  });

  const basketFiltersSchema = Joi.object({
    filteredStores: Joi.object()
      .pattern(Joi.string(), Joi.boolean().valid(true))
      .required(),
    maxStores: Joi.number().allow(null).required(),
  });

  const filtersSchema = Joi.object({
    searchPreferences: searchFiltersSchema.required(),
    basketFilters: basketFiltersSchema.required(),
  });

  const userCreationVal = Joi.object({
    uid: Joi.string().required(),
    name: Joi.string().min(3).max(32).optional(),
    email: Joi.string().min(3).max(256).email().optional(),
    location: locationSchema.required(),
    account: accountSchema.required(),
    supplierInfo: supplierInfoSchema.optional(),
    adminInfo: adminInfoSchema.optional(),
    membership: Joi.object()
      .pattern(Joi.string(), Joi.boolean().valid(true))
      .required(),
    preferences: preferencesSchema.required(),
    items: Joi.object().pattern(Joi.string(), itemSchema).required(),
    filters: filtersSchema.required(),
  });

  return userCreationVal.validate(user);
};

export default userCreationValidation;
