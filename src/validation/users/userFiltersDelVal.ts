import Joi from "joi"
import categories from "../../data/data"

/**
 * Validates user filters deletion request body
 * @param {object} body - Request body
 * @param {string[]} [body.categories] - Categories to remove (categories; from data.ts)
 * @param {string[]} [body.stores] - Store IDs to remove from search filters (MongoDB ObjectIds)
 * @param {string[]} [body.filteredStores] - Store IDs to remove from basket filters (MongoDB ObjectIds)
 * @param {boolean} [body.maxStores] - Whether to reset maxStores to null
 * @returns {Joi.ValidationResult} - Validation result
 * @see {@link https://joi.dev/api/?v=17.4.0#objectobject-schema} for more information
 */
const userFilterDelVal = (body:any) => {
  const schema = Joi.object({
    categories: Joi.array().items(Joi.string().valid(...Array.from(categories))),
    stores: Joi.array().items(Joi.string()),
    filteredStores: Joi.array().items(Joi.string()),
    maxStores: Joi.number().allow(null),
  })

  return schema.validate(body)
}

export default userFilterDelVal