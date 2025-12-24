const { check, validationResult } = require('express-validator');

// input validation
exports.runValidation = (request, response, next) => {
  const errors = validationResult(request);
  let errorsList = errors.array().map((error) => error.msg);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errorsList });
  }
  next();
};
