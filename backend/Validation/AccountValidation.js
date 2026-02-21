import Joi from "joi";

// helper ObjectId MongoDB
const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  "string.pattern.base": "ObjectId invalide (24 caractères hex).",
});

export const addAccountSchema =Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().trim().min(2).required(),
    familyName: Joi.string().trim().min(2).required(),
    role: Joi.string().valid("user", "admin").optional(),
    password: Joi.string().min(6).required(),
  }).required()
    .options({ abortEarly: false, allowUnknown: false }),

  params: Joi.object({}).unknown(true),
  query: Joi.object({}).unknown(true),
});
export const updateAccountSchema = Joi.object({
  params: Joi.object({
    id: objectId.required().messages({
      "any.required": "id est obligatoire",
    }),
  }).required(),

  body: Joi.object({
    nameAccount: Joi.string().trim().min(2).max(50).optional(),
    solde: Joi.number().precision(2).optional(),
    Sharingcode: Joi.string().trim().min(4).max(20).optional(),
    nbUsers: Joi.number().integer().min(1).max(50).optional(),
    Users: Joi.array().items(objectId).optional(),
    isBlocked: Joi.boolean().optional(),
  })
    .min(1)
    .messages({ "object.min": "Body vide: au moins un champ à modifier" })
});
