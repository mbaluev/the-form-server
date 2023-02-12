const passport = require('passport');
const pool = require("../utils/pool");

const localStrategy = require('./strategy/local');
const jwtUserStrategy = require('./strategy/jwt-user');
const jwtAdminStrategy = require('./strategy/jwt-admin');
const jwtStudentStrategy = require('./strategy/jwt-student');

passport.serializeUser((user, done) => {
  return done(null, user.id);
});
passport.deserializeUser((id, done) => {
  const query = `SELECT id, firstname, lastname, username, active, paid, admin FROM users WHERE id = $1`;
  const params = [id];
  pool.query(query, params, (err, res) => {
    if (err) return done(err, false);
    if (res.rowCount === 0) return done(null, false);
    const user = res.rows[0];
    return done(null, user);
  })
});

passport.use('local', localStrategy);
passport.use('jwt-user', jwtUserStrategy);
passport.use('jwt-admin', jwtAdminStrategy);
passport.use('jwt-student', jwtStudentStrategy);

module.exports = passport;