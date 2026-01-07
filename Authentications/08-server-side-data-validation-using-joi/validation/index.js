const Joi = require('joi');

exports.runValidation = (schema) => {
  return (request, response, next) => {
    const { error } = schema.validate(request.body, {
      abortEarly: false,
      errors: { wrap: { label: '' } },
    });

    if (error) {
      const errorList = error.details.map((error) => error.message);
      return response.status(404).json({ message: 'invalid input', errorList });
    }
    next();
  };
};
