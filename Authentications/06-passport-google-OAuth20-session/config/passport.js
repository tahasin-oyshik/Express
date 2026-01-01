require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const User = require('../models/user.model');

// GOOGLE OAUTH STRATEGY: defines how to authenticate users with Google and handle user creation (used in app.js /auth/google and /auth/google/callback routes)
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:4000/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const user = await User.findOne({ googleId: profile.id });

        // if user doesn't exist, create a new user with Google ID
        if (!user) {
          const user = new User({
            googleId: profile.id,
            username: profile.displayName,
          });
          await user.save();
        }

        return cb(null, user);
      } catch (error) {
        return cb(error, null);
      }
    },
  ),
);

// SERIALIZE: saves only user ID to session after successful login (keeps session data small)
passport.serializeUser((user, done) => {
  done(null, user.id); // Stores user.id in MongoDB 'sessions' collection
});

// DESERIALIZE: retrieves full user data from database using the ID stored in session
// This runs on EVERY request to make user data available as req.user in app.js routes
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // Get full user object from database
    done(null, user); // Attach user object to req.user
  } catch (error) {
    done(error, false);
  }
});
