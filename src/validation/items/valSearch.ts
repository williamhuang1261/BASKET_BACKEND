import Joi from "joi";
import categories from "../../data/categories.js";

const valSearch = (body: any) => {
  const schema = Joi.object({
    config: Joi.object({
      value: Joi.string().required().min(1).max(32),
      categories: Joi.array()
        .items(Joi.string().valid(...categories))
        .min(0)
        .max(categories.size)
        .required(),
      language: Joi.string().valid("en", "fr").required(),
    }).required(),
  });
  return schema.validate(body);
};

export default valSearch;
