import Joi from "joi";
import mongoose from "mongoose";
// helper ObjectId MongoDB
const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  "string.pattern.base": "ObjectId invalide (24 caractères hex).",
});

/*const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};*/

export const addOperationSchema = Joi.object({
  params: Joi.object({
    AccountId: objectId.required().messages({
      "any.required": "id est obligatoire",
    }),
  }).required(),

  body:Joi.object({  
    amount: Joi.number().positive().required(),
    date: Joi.date().iso().default(() => new Date()),
    categoryId:Joi.string().required(),
    description:Joi.string().optional(),
    //IdAccount: Joi.string().custom(objectId, "ObjectId validation").required(),
    
  }).required().unknown(false),
});

export const updateOperationSchema = Joi.object({
  params: Joi.object({
    IdOperation: objectId.required().messages({
      "any.required": "id  operation est obligatoire",
    }),
  }).required(),

  body: Joi.object({
    amount: Joi.number().optional(),
    solde: Joi.number().precision(2).optional(),
    date: Joi.date().iso().optional(),
    categoryId:Joi.string().optional(),
    description:Joi.string().optional(),

  })
    .min(1)
    .messages({ "object.min": "Body vide: au moins un champ à modifier" })
    .unknown(false)
});

