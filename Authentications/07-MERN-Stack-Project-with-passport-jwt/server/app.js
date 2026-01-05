require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const passport = require('passport');

const User = require('./models/user.model');

const app = express();
require('./config/database');

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(passport.initialize());

require('./config/passport');

// home route
app.get('/', (request, response) => {
  response.send('<h1>Welcome to the server</h1>');
});

// register route
app.post('/register', async (request, response) => {
  try {
    const user = await User.findOne({ username: request.body.username });
    if (user) return response.status(400).send('user already exits');

    bcrypt.hash(request.body.password, saltRounds, async (err, hash) => {
      const newUser = new User({
        username: request.body.username,
        password: hash,
      });
      await newUser
        .save()
        .then((user) => {
          response.send({
            success: true,
            message: 'user is created successfully',
            user: {
              id: user._id,
              username: user.username,
            },
          });
        })
        .catch((error) => {
          response.send({
            success: false,
            message: 'user is not created',
            error: error,
          });
        });
    });
  } catch (error) {
    response.status(500).send(error.message);
  }
});

// login route
app.post('/login', async (request, response) => {
  const user = await User.findOne({ username: request.body.username });
  if (!user) {
    return response.status(401).send({
      success: false,
      message: 'user is not found',
    });
  }

  if (!bcrypt.compareSync(request.body.password, user.password)) {
    return response.status(401).send({
      success: false,
      message: 'Incorrect password',
    });
  }

  const payload = {
    id: user._id,
    username: user.username,
  };

  const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '2d' });

  return response.status(200).send({
    success: true,
    message: 'user is logged in successfully',
    token: 'Bearer ' + token,
  });
});

// profile route
app.get('/profile', passport.authenticate('jwt', { session: false }), (request, response) => {
  return response.status(200).send({
    success: true,
    user: {
      id: request.user._id,
      username: request.user.username,
    },
  });
});

// resource not found
app.use((request, response, next) => {
  response.status(404).json({ message: 'route not found' });
});

// server error
app.use((error, request, response, next) => {
  console.error(error.stack);
  response.status(500).json({ message: 'something broke!' });
});

module.exports = app;
