const LocalStrategy = require('passport-local');
const cryptoPass = require("../../../../prisma/utils/cryptoPass");
const db = require("../../utils/init")

module.exports = new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  (username, password, done) => {

  const query = "SELECT id, firstname, lastname, username, password, salt, active, paid, admin FROM users WHERE username = ?"
  const params = [username];
  db.get(query, params, function(err, user) {
    if (err) return done(err);
    if (!user) return done(null, false);
    const hashedPassword = cryptoPass(user.salt, password);
    if (user.password !== hashedPassword) return done(null, false);
    return done(null, user);
  });
});