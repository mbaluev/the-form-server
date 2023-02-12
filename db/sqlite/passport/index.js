const passport = require('passport');
const db = require("../utils/init")

const localStrategy = require('./strategy/local');
const jwtUserStrategy = require('./strategy/jwt-user');
const jwtAdminStrategy = require('./strategy/jwt-admin');
const jwtStudentStrategy = require('./strategy/jwt-student');

passport.serializeUser((user, done) => {
  return done(null, user.id);
});
passport.deserializeUser((id, done) => {
  db.get('SELECT id, firstname, lastname, username, active, paid, admin FROM users WHERE id = ?', id, (err, user) => {
    if (err) return done(err);
    if (!user) return done(null, false);
    return done(null, user);
  });
});

passport.use('local', localStrategy);
passport.use('jwt-user', jwtUserStrategy);
passport.use('jwt-admin', jwtAdminStrategy);
passport.use('jwt-student', jwtStudentStrategy);

module.exports = passport;