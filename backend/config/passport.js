const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      // Generate a unique username: email prefix + short googleId
      const email = profile.emails[0].value;
      const emailPrefix = email.split('@')[0];
      const uniqueUsername = `${emailPrefix}_${profile.id.slice(0, 8)}`;
      // Ensure username is unique in DB
      let finalUsername = uniqueUsername;
      let counter = 1;
      while (await User.findOne({ username: finalUsername })) {
        finalUsername = `${uniqueUsername}${counter}`;
        counter++;
      }
      user = await new User({
        googleId: profile.id,
        name: profile.displayName,
        contact: email, // Use email as contact
        username: finalUsername,
      }).save();
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

module.exports = passport;