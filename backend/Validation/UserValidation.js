import Joi from "joi";
export const addUserSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().trim().min(2).max(50).required(),
  familyName: Joi.string().trim().min(2).max(50).required(),
  role: Joi.string().valid("user", "admin").default("user"),
  password: Joi.string()
  .min(6)
  .pattern(/[A-Z]/, "uppercase")
  .pattern(/[a-z]/, "lowercase")
  .pattern(/[0-9]/, "number")
  .pattern(/[^A-Za-z0-9]/, "special character")
  .required()
  .messages({
    "string.min": "At least 6 characters",
    "string.pattern.name": "Contains {#name}",
    "any.required": "Password is required",
  }),
}).required();

// update

export const updateUserSchema = Joi.object({
  body: Joi.object({
  name: Joi.string().trim().min(2).max(50),
  familyName: Joi.string().trim().min(2).max(50),
  email: Joi.string().trim().email(),
  isActive: Joi.boolean(),
  role: Joi.string().valid("user", "admin"),
  })
}); 
//.min(1)