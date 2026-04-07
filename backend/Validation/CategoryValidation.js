import Joi from "joi";
import mongoose from "mongoose";

// helper ObjectId MongoDB
const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  "string.pattern.base": "ObjectId invalide (24 caractères hex).",
});

// groupes normalisés pour BI + Coach Budget
const normalizedGroups = [
  "HOUSING",
  "FOOD_HOME",
  "EATING_OUT",
  "TRANSPORT",
  "HEALTH_BEAUTY",
  "CHILDREN",
  "ENTERTAINMENT",
  "SHOPPING",
  "SMOKING_ALCOHOL_CAFE",
  "BILLS",
  "SAVINGS",
  "OTHER",
];

// add
export const addCategorySchema = Joi.object({
  params: Joi.object({
    AccountId: objectId.required().messages({
      "any.required": "id est obligatoire",
    })
  }).required(),

  body: Joi.object({
    name: Joi.string().trim().min(2).max(40).required(),

    normalizedGroup: Joi.string()
      .valid(...normalizedGroups)
      .default("OTHER")
      .messages({
        "any.only": "Le groupe normalisé est invalide.",
      }),

    budget: Joi.number().min(0).required(),

    color: Joi.string().default("#000000"),

    isDefault: Joi.boolean().default(false),

    icon: Joi.string().optional(),
  }).unknown(false)
});

// update
export const updateCategorySchema = Joi.object({
  params: Joi.object({
    IdCategory: objectId.required().messages({
      "any.required": "id est obligatoire",
    })
  }).required(),

  body: Joi.object({
    name: Joi.string().trim().min(2).max(40).optional(),

    normalizedGroup: Joi.string()
      .valid(...normalizedGroups)
      .optional()
      .messages({
        "any.only": "Le groupe normalisé est invalide.",
      }),

    color: Joi.string().optional(),

    isDefault: Joi.boolean().optional(),

    budget: Joi.number().min(0).default(0),

    icon: Joi.string().optional(),
  })
    .min(1)
    .messages({ "object.min": "Body vide: au moins un champ à modifier" })
    .unknown(false)
});