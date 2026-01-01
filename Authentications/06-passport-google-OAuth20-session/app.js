// DEPENDENCIES & IMPORTS
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');
require('dotenv').config();

// Database connection
require('./config/database');

// Passport configuration (Google OAuth Strategy setup)
require('./config/passport');

const app = express();

app.set('view engine', 'ejs');

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// Home route
app.get('/', (request, response) => {
  response.render('index');
});

const checkLoggedIn = (request, response, next) => {
  if (request.isAuthenticated()) {
    return response.redirect('/profile');
  }
  next();
};

// Show login page with Google OAuth button (redirect to profile if already logged in)
app.get('/login', checkLoggedIn, (request, response) => {
  response.render('login');
});

// Initiate Google OAuth authentication (redirects user to Google login page)
app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));
// Google OAuth callback route (handles response from Google after user authentication)
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', successRedirect: '/profile' }),
);

const checkAuthenticated = (request, response, next) => {
  if (request.isAuthenticated()) {
    return next();
  }
  response.redirect('/login');
};

// User profile page (only accessible when logged in)
app.get('/profile', checkAuthenticated, (request, response) => {
  response.render('profile', { username: request.user.username });
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
