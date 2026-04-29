const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/userModel');

function configurePassport(passport) {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      // profile contains id, displayName, emails, photos
      // find or create a user in your database
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0].value
          });
        }
        done(null, user);
      } catch (err) {
        done(err, false);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user._id); // store just the ID in the session
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user); // attach full user object to req.user
    } catch (err) {
      done(err, null);
    }
  });
}

module.exports = configurePassport;
