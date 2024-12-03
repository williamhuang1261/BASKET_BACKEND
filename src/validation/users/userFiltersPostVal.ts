import Joi from "joi";
import categories from "../../data/data";

/**
 * Validates user filters addition request body
 * @param {object} body - Request body
 * @param {object} [body.searchFilters] - Search filters
 * @param {object} [body.searchFilters.distance] - Distance filter
 * @param {number} body.searchFilters.distance.amount - Distance amount
 * @param {string} body.searchFilters.distance.units - Distance units (km, mi)
 * @param {string[]} [body.searchFilters.categories] - Category filters (categories; from data.ts)
 * @param {string[]} [body.searchFilters.stores] - Store ID filters (MongoDB ObjectIds)
 * @param {object} [body.basketFilters] - Basket filters
 * @param {string[]} [body.basketFilters.filteredStores] - Filtered store IDs (MongoDB ObjectIds)
 * @param {number} [body.basketFilters.maxStores] - Maximum number of stores
 * @returns {Joi.ValidationResult} - Validation result
 * @see {@link https://joi.dev/api/?v=17.4.0#objectobject-schema} for more information
 */
const userFiltersPostVal = (body: any) => {
  const schema = Joi.object({
    searchFilters: Joi.object({
      distance: Joi.object({
        amount: Joi.number().positive().required(),
        units: Joi.string().valid("km", "mi").required(),
      }),
      categories: Joi.array().items(Joi.string().valid(... Array.from(categories))),
      stores: Joi.array().items(Joi.string().valid()),
    }),
    basketFilters: Joi.object({
      filteredStores: Joi.array().items(Joi.string()),
      maxStores: Joi.number().allow(null).positive(),
    }),
  });

  return schema.validate(body);
};

export default userFiltersPostVal;
