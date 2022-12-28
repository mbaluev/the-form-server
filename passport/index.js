const passport = require('passport');
const db = require("../db/utils/init")

const localStrategy = require('./strategy/local');
const jwtStrategy = require('./strategy/jwt');
const jwtAdminStrategy = require('./strategy/jwt-admin');

passport.serializeUser((user, done) => {
  return done(null, user.id);
});
passport.deserializeUser((id, done) => {
  db.get('SELECT id, username, active, paid, admin FROM users WHERE id = ?', id, (err, user) => {
    if (err) return done(err);
    if (!user) return done(null, false);
    return done(null, user);
  });
});

passport.use('local', localStrategy);
passport.use('jwt', jwtStrategy);
passport.use('jwt-admin', jwtAdminStrategy);

module.exports = passport;