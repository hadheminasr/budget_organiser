import Joi from "joi";
import mongoose from "mongoose";

const objectId = (value, helpers) => {
  if (value === null) return value;
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

export const addCategorySchema = Joi.object({
  body: Joi.object({
    name: Joi.string().trim().min(2).max(40).required(),

    color: Joi.string()
      .trim()
      .pattern(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
      .default("#000000"),

    isDefault: Joi.boolean().default(false),

    AccountId: Joi.alternatives()
      .try(
        Joi.string().custom(objectId, "ObjectId validation"),
        Joi.valid(null)
      )
      .default(null),
  }).required(),

  params: Joi.object({}).unknown(true),
  query: Joi.object({}).unknown(true),
});
