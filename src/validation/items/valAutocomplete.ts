import Joi from "joi";

const valAutocomplete = (body: any) => {
  const schema = Joi.object({
    config: Joi.object({
      value: Joi.string().min(2).max(20).required(),
      language: Joi.string().valid("en", "fr").required(),
      count: Joi.number().min(1).max(10).required(),
    }).required()
  });

  return schema.validate(body);
}

export default valAutocomplete;