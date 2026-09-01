import Joi from "joi";

const valEvent = (body: any) => {
  const schema = Joi.object({
    experimentId: Joi.string().required().min(1).max(128),
    variant: Joi.string().valid("A", "B").required(),
    eventType: Joi.string().valid("exposure", "conversion").required(),
    sessionId: Joi.string().required().min(1).max(128),
  });
  return schema.validate(body);
};

export default valEvent;
