import Joi from "joi";
import mongoose from "mongoose";

// helper ObjectId MongoDB
const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  "string.pattern.base": "ObjectId invalide (24 caractères hex).",
});
//add
export const addCategorySchema = Joi.object({
  params:Joi.object({
    AccountId:objectId.required().messages({
      "any.required": "id est obligatoire",
    }
    )
  }).required(),
  body:Joi.object({

  name: Joi.string().trim().min(2).max(40).required(),
  budget: Joi.number().min(0).default(0), 
  color: Joi.string().default("#000000"),
  isDefault: Joi.boolean().default(false),
  icon:   Joi.string().optional(),
  }).unknown(false)
});
//update
export const updateCategorySchema = Joi.object({
  params:Joi.object({
    IdCategory:objectId.required().messages({
      "any.required": "id est obligatoire",
    }
    )
  }).required(),

  body:Joi.object({
    name: Joi.string().trim().min(2).max(40).optional(),
    color: Joi.string().optional(),
    isDefault: Joi.boolean().optional(),
    budget: Joi.number().min(0).default(0), 
    icon:   Joi.string().optional(),

  }).min(1).messages({ "object.min": "Body vide: au moins un champ à modifier" }).unknown(false)
})