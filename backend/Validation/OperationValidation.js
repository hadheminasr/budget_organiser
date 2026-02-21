import Joi from "joi";
import mongoose from "mongoose";

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

export const addOperationSchema = Joi.object({
  body: Joi.object({
    ammount: Joi.number().positive().required(),
    type: Joi.string().valid("depense", "revenue").required(),
    date: Joi.date().iso().default(() => new Date()),
    accountId: Joi.string().custom(objectId, "ObjectId validation").required(),
    categoryId: Joi.string().custom(objectId, "ObjectId validation").required(),
  }).required(),
});
