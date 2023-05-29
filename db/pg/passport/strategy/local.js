const LocalStrategy = require('passport-local');
const cryptoPass = require("../../../../prisma/utils/cryptoPass");
const pool = require("../../utils/pool");

module.exports = new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  (username, password, done) => {
  const query = `SELECT id, firstname, lastname, username, password, salt, active, paid, admin FROM users WHERE username = $1`;
  const params = [username];
  pool.query(query, params, (err, res) => {
    if (err) return done(err);
    if (res.rowCount === 0) return done(null, false);
    const user = res.rows[0];
    const hashedPassword = cryptoPass(user.salt, password);
    if (user.password !== hashedPassword) return done(null, false);
    return done(null, user);
  })
});