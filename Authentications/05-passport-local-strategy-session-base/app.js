// ============================================
// DEPENDENCIES & IMPORTS
// ============================================
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcrypt');
const MongoStore = require('connect-mongo');
require('dotenv').config();

// Database connection
require('./config/database');

// Passport configuration (Local Strategy setup)
require('./config/passport');

// User model
const User = require('./models/user.model');

const app = express();
const saltRounds = 10;

// Set EJS to render .ejs files (index.ejs, login.ejs, register.ejs, profile.ejs) into HTML
app.set('view engine', 'ejs');

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session setup: creates storage in MongoDB 'sessions' collection to remember logged-in users.
app.set('trust proxy', 1);
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      collectionName: 'sessions',
    }),
    // cookie: { secure: true },
  }),
);

// Passport setup: saves user ID to session on login, then loads user data on every request.
app.use(passport.initialize());
app.use(passport.session());

// Home route
app.get('/', (request, response) => {
  response.render('index');
});

// Show registration form
app.get('/register', (request, response) => {
  response.render('register');
});

// Handle user registration
app.post('/register', async (request, response) => {
  try {
    const user = await User.findOne({ username: request.body.username });
    if (user) return response.status(400).send('user already exists');

    bcrypt.hash(request.body.password, saltRounds, async (err, hash) => {
      const newUser = new User({
        username: request.body.username,
        password: hash,
      });
      await newUser.save();
      response.redirect('/login');
    });
  } catch (error) {
    response.status(500).send(error.message);
  }
});

// CUSTOM MIDDLEWARE
const checkLoggedIn = (request, response, next) => {
  if (request.isAuthenticated()) {
    return response.redirect('/profile');
  }
  next();
};

// Show login form (redirect to profile if already logged in)
app.get('/login', checkLoggedIn, (request, response) => {
  response.render('login');
});

// Handle user login
app.post(
  '/login',
  passport.authenticate('local', { failureRedirect: '/login', successRedirect: '/profile' }),
);

// CUSTOM MIDDLEWARE
const checkAuthenticated = (request, response, next) => {
  if (request.isAuthenticated()) {
    return next();
  }
  response.redirect('/login');
};

// User profile page (only accessible when logged in)
app.get('/profile', checkAuthenticated, (request, response) => {
  response.render('profile');
});

// Handle user logout
app.get('/logout', (request, response) => {
  try {
    request.logout((error) => {
      if (error) {
        return next(error);
      }
      response.redirect('/');
    });
  } catch (error) {
    response.status(500).send(error.message);
  }
});

module.exports = app;
