const { check } = require('express-validator');

exports.userRegistrationValidator = [
  // input validation rules
  check('name')
    .trim()
    .notEmpty()
    .withMessage('Name is missing')
    .isLength({ min: 5 })
    .withMessage('name must have at least 5 character')
    .isLength({ max: 10 })
    .withMessage('name can have maximum 10 character'),
  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is missing')
    .isEmail()
    .withMessage('Not a valid email'),
  check('password')
    .trim()
    .notEmpty()
    .withMessage('Password is missing')
    .isLength({ min: 5 })
    .withMessage('password must have at least 5 character'),
  check('dob')
    .trim()
    .notEmpty()
    .withMessage('dob is missing')
    .isISO8601()
    .toDate()
    .withMessage('Not a valid dob'),
];

exports.userLoginValidator = [
  // input validation rules
  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is missing')
    .isEmail()
    .withMessage('Not a valid email'),
  check('password')
    .trim()
    .notEmpty()
    .withMessage('Password is missing')
    .isLength({ min: 5 })
    .withMessage('password must have at least 5 character'),
];
