import Joi from "joi";
import { allUnits, distanceUnits, weightUnits } from "../../data/units.js";
import categories from "../../data/data.js";

export const valName = (body: any) => {
  return Joi.string().min(3).max(32).required().validate(body);
};

export const valEmail = (body: any) => {
  return Joi.string().min(3).max(256).email().required().validate(body);
};

export const valLocation = (body: any) => {
  if (!body)
    return { error: { details: [{ message: "Location is undefined" }] } };
  if (body.type || body.coordinates || body.formattedAddress) {
    if (!body.type || !body.coordinates || !body.formattedAddress) {
      return {
        error: {
          details: [
            {
              message:
                "Location type/coordinates/formattedAddress must be provided together",
            },
          ],
        },
      };
    }
  }
  const locationSchema = Joi.object({
    country: Joi.string().valid("Canada", "USA").max(64).required(),
    type: Joi.string().valid("Point").default("Point").optional(),
    coordinates: Joi.array().items(Joi.number()).length(2).optional(),
    formattedAddress: Joi.string().max(256).optional(),
  }).required();
  return locationSchema.validate(body);
};

export const valMembership = (body: any) => {
  const membershipSchema = Joi.array()
    .items(Joi.string().max(128))
    .max(32)
    .required();
  return membershipSchema.validate(body);
};

export const valPreferences = (body: any) => {
  const preferencesSchema = Joi.object({
    weightUnits: Joi.string()
      .valid(...Array.from(weightUnits))
      .optional(),
    distUnits: Joi.string()
      .valid(...Array.from(distanceUnits))
      .optional(),
    language: Joi.string().valid("en", "fr").optional(),
  }).required();
  return preferencesSchema.validate(body);
};

export const valItemsAdd = (body: any, currNum: number) => {
  if (!body?.length) {
    return { error: { details: [{ message: "Items is undefined" }] } };
  }
  if (currNum + body.length > 32) {
    return {
      error: {
        details: [
          {
            message: "Cannot have more than 32 items",
          },
        ],
      },
    };
  }

  const itemsSchema = Joi.object({
    id: Joi.string().max(32).required(),
    select: Joi.object({
      method: Joi.string().valid("weight", "unit").required(),
      units: Joi.string()
        .valid(...Array.from(allUnits))
        .required(),
      quantity: Joi.number().positive().required(),
    }).required(),
  });
  return Joi.array().items(itemsSchema).max(32).required().validate(body);
};

export const valItemsRemove = (body: any) => {
  return Joi.array()
    .items(Joi.string().max(32))
    .max(32)
    .required()
    .validate(body);
};

export const valItemsUpdate = (body: any) => {
  const itemsSchema = Joi.object({
    id: Joi.string().max(32).required(),
    select: Joi.object({
      method: Joi.string().valid("weight", "unit").required(),
      units: Joi.string()
        .valid(...Array.from(allUnits))
        .required(),
      quantity: Joi.number().positive().required(),
    }).required(),
  });
  return Joi.array().items(itemsSchema).max(32).required().validate(body);
};

export const valSearchPreferencesDistance = (body: any) => {
  return Joi.object({
    amount: Joi.number().positive().required(),
    units: Joi.string()
      .valid(...Array.from(distanceUnits))
      .required(),
  })
    .required()
    .validate(body);
};

export const valSearchPreferencesCategories = (body: any) => {
  return Joi.array()
    .items(
      Joi.string()
        .max(128)
        .valid(...Array.from(categories))
    )
    .max(32)
    .required()
    .validate(body);
};

export const valSearchPreferencesStores = (body: any) => {
  return Joi.array()
    .items(Joi.string().max(128))
    .max(32)
    .required()
    .validate(body);
};

export const valBasketFiltersFilteredStores = (body: any) => {
  return Joi.array()
    .items(Joi.string().max(128))
    .max(32)
    .required()
    .validate(body);
};

export const valBasketFiltersMaxStores = (body: any) => {
  return Joi.number().positive().max(8).allow(null).required().validate(body);
};
