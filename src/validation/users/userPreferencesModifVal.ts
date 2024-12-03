import Joi from "joi";
import { distanceUnitsType, weightUnitsType } from "../../data/units";
import exp from "constants";

/**
 * Validates user preferences modification request body
 * @param {object} body - Request body
 * @param {string} [body.weightUnits] - Weight unit preference (weightUnitsType; from data/units.ts)
 * @param {string} [body.distUnits] - Distance unit preference (distanceUnitsType; from data/units.ts)
 * @param {string} [body.language] - Language preference ('en', 'fr')
 * @returns {Joi.ValidationResult} - Validation result
 * @see {@link https://joi.dev/api/?v=17.4.0#objectobject-schema} for more information
 */
const userPreferencesModifVal = (body: any) => {
  const schema = Joi.object({
    weightUnits: Joi.string().valid(...Array.from(weightUnitsType)),
    distUnits: Joi.string().valid(...Array.from(distanceUnitsType)),
    language: Joi.string().valid("en", "fr"),
  });

  return schema.validate(body);
};

export default userPreferencesModifVal;
