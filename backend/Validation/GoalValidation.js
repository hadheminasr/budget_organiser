import Joi from "joi";

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  "string.pattern.base": "ObjectId invalide",
});

export const addGoalSchema = Joi.object({
  params: Joi.object({
    accountId: objectId.required().messages({
      "any.required": "accountId est obligatoire",
    }),
  }).required(),

  body: Joi.object({
    name: Joi.string().trim().min(2).max(60).required().messages({
      "any.required": "name est obligatoire",
      "string.empty": "name est obligatoire",
    }),
    targetAmount: Joi.number().min(0).required().messages({
      "any.required": "targetAmount est obligatoire",
      "number.base": "targetAmount doit être un nombre",
    }),
    TargetDate: Joi.date().iso().required().messages({
      "any.required": "TargetDate est obligatoire",
      "date.format": "TargetDate doit être une date ISO",
    }),
    StartDate: Joi.date().iso().optional(),
    

    isActive: Joi.boolean().optional(),
    isAchieved: Joi.boolean().optional(),
  })
    .required()
    .options({ abortEarly: false, allowUnknown: false }),

  query: Joi.object({}).unknown(true),
});
