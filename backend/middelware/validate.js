import Joi from "joi";

export const validate = (schema) => (req, res, next) => {
  const dataToValidate = {
    params: req.params,
    body: req.body,
    query: req.query,
  };

  const { error, value } = schema.validate(dataToValidate, {
    abortEarly: false,
    allowUnknown: true, // pour ne pas bloquer les autres props de req
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((d) => d.message),
    });
  }



  next();
};