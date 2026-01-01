const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user.model');

// LOCAL STRATEGY: defines how to verify username and password on login (used in app.js POST /login route)
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // Step 1: Find user in database by username
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: 'Incorrect Username' });
      }
      // Step 2: Compare entered password with hashed password in database
      if (!(await bcrypt.compare(password, user.password))) {
        return done(null, false, { message: 'Incorrect password' });
      }
      // Step 3: If username and password are correct, return user object
      return done(null, user);
    } catch (error) {
      return done(err);
    }
  }),
);

// SERIALIZE: saves only user ID to session after successful login (keeps session data small)
// This runs when user logs in at POST /login route in app.js
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
