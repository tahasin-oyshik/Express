const express = require('express');

const userRouter = express.Router();

const { runValidation } = require('../validation/index');
const { schemas } = require('../validation/schemas');
const { registerUser, loginUser } = require('../controllers/user');

// api/register
userRouter.post('/register', runValidation(schemas.registerSchema), registerUser);

// api/login
userRouter.post('/login', runValidation(schemas.loginSchema), loginUser);

module.exports = userRouter;
