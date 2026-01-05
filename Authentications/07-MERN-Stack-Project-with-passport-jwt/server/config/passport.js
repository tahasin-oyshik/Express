require('dotenv').config();
const User = require('../models/user.model');
const JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;
const passport = require('passport');
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET_KEY;

console.log('[Passport] JWT Secret configured:', process.env.SECRET_KEY ? 'Yes' : 'No');

passport.use(
  new JwtStrategy(opts, async function (jwt_payload, done) {
    console.log('[Passport] JWT Strategy called');
    console.log('[Passport] JWT Payload:', jwt_payload);

    try {
      const user = await User.findOne({ _id: jwt_payload.id });
      console.log('[Passport] User lookup result:', user ? `Found: ${user.username}` : 'Not found');

      if (user) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'User not found' });
      }
    } catch (err) {
      console.error('[Passport] Error during user lookup:', err);
      return done(err, false);
    }
  }),
);
