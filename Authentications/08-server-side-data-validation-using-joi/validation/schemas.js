const Joi = require('joi');

exports.schemas = {
  registerSchema: Joi.object({
    name: Joi.string().min(3).max(31).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(8).required(),
    confirmPassword: Joi.ref('password'),
    age: Joi.number().required(),
    languages: Joi.array().items(Joi.string()).required(),
    isRegistered: Joi.boolean().required(),
    dob: Joi.date().greater(new Date('2000-10-01')).required(),
  }),
  loginSchema: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(8).required(),
  }),
};
