const userRoutes = require('express').Router();
const { body, validationResult } = require('express-validator');
const { runValidation } = require('../validation');
const { registerUser, loginUser } = require('../controllers/user');
const { userRegistrationValidator, userLoginValidator } = require('../validation/auth');

// This route handles new user registration with validation.
// Required fields: name, email, password, dob (date of birth)
userRoutes.post('/register', userRegistrationValidator, runValidation, registerUser);

// This route handles user login with validation.
// Required fields: email, password
userRoutes.post('/login', userLoginValidator, runValidation, loginUser);

module.exports = userRoutes;
