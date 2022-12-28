const passport = require('passport');
const db = require("../db/utils/init")

const localStrategy = require('./strategy/local');
const jwtStrategy = require('./strategy/jwt');

passport.serializeUser((user, done) => {
  return done(null, user.id);
});
passport.deserializeUser((id, done) => {
  db.get('SELECT id, username FROM User WHERE id = ?', id, (err, user) => {
    if (err) return done(err);
    if (!user) return done(null, false);
    return done(null, user);
  });
});

passport.use('local', localStrategy);
passport.use('jwt', jwtStrategy);

module.exports = passport;