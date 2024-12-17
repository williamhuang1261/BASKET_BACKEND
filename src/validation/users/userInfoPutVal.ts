import Joi from "joi";
import {
  allUnitsType,
  distanceUnitsType,
  weightUnitsType,
} from "../../data/units";

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

export const valMembershipAdd = (body: any, currNum: number) => {
  if (!body?.length) {
    return { error: { details: [{ message: "Membership is undefined" }] } };
  }
  if (currNum + body.length > 32) {
    return {
      error: {
        details: [
          {
            message: "Cannot have more than 32 memberships",
          },
        ],
      },
    };
  }
  return Joi.array()
    .items(Joi.string().max(32))
    .max(32)
    .required()
    .validate(body);
};

export const valMembershipRemove = (body: any) => {
  return Joi.array()
    .items(Joi.string().max(32))
    .max(32)
    .required()
    .validate(body);
};

export const valPreferences = (body: any) => {
  const preferencesSchema = Joi.object({
    weightUnits: Joi.string()
      .valid(...Array.from(weightUnitsType))
      .optional(),
    distUnits: Joi.string()
      .valid(...Array.from(distanceUnitsType))
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
        .valid(...Array.from(allUnitsType))
        .required(),
      quantity: Joi.number().positive().required(),
    }).required(),
  });
  return Joi.array().items(itemsSchema).max(32).required().validate(body);
};

export const valItemsRemove = (body: any) => {
  return Joi.array().items(Joi.string().max(32)).max(32).required().validate(body);
};

export const valItemsUpdate = (body: any) => {
  const itemsSchema = Joi.object({
    id: Joi.string().max(32).required(),
    select: Joi.object({
      method: Joi.string().valid("weight", "unit").required(),
      units: Joi.string()
        .valid(...Array.from(allUnitsType))
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
      .valid(...Array.from(distanceUnitsType))
      .required(),
  }).required().validate(body);
};

export const valSearchPreferencesCategoriesAdd = (body: any, currNum: number) => {
  if (!body?.length) {
    return { error: { details: [{ message: "Categories is undefined" }] } };
  }
  if (currNum + body.length > 32) {
    return {
      error: {
        details: [
          {
            message: "Cannot have more than 32 categories",
          },
        ],
      },
    };
  }
  return Joi.array().items(Joi.string().max(32)).max(32).required().validate(body);
};

export const valSearchPreferencesCategoriesRemove = (body: any) => {
  return Joi.array().items(Joi.string().max(32)).max(32).required().validate(body);
};

export const valSearchPreferencesStoresAdd = (body: any, currNum: number) => {
  if (!body?.length) {
    return { error: { details: [{ message: "Stores is undefined" }] } };
  }
  if (currNum + body.length > 32) {
    return {
      error: {
        details: [
          {
            message: "Cannot have more than 32 stores",
          },
        ],
      },
    };
  }
  return Joi.array().items(Joi.string().max(32)).max(32).required().validate(body);
};

export const valSearchPreferencesStoresRemove = (body: any) => {
  return Joi.array().items(Joi.string().max(32)).max(32).required().validate(body);
};

export const valBasketFiltersFilteredStoresAdd = (body: any, currNum: number) => {
  if (!body?.length) {
    return { error: { details: [{ message: "Stores is undefined" }] } };
  }
  if (currNum + body.length > 32) {
    return {
      error: {
        details: [
          {
            message: "Cannot have more than 32 stores",
          },
        ],
      },
    };
  }
  return Joi.array().items(Joi.string().max(32)).max(32).required().validate(body);
};

export const valBasketFiltersFilteredStoresRemove = (body: any) => {
  return Joi.array().items(Joi.string().max(32)).max(32).required().validate(body);
};

export const valBasketFiltersMaxStores = (body: any) => {
  return Joi.number().positive().max(8).allow(null).required().validate(body);
};
