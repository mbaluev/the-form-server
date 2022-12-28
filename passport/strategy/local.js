const LocalStrategy = require('passport-local');
const cryptoPass = require("../../db/utils/cryptoPass");
const db = require("../../db/utils/init")

module.exports = new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  (email, password, done) => {
    db.get('SELECT * FROM users WHERE username = ?', email, function(err, user) {
      if (err) return done(err);
      if (!user) return done(null, false);
      const hashedPassword = cryptoPass(user.salt, password);
      if (user.password !== hashedPassword) return done(null, false);
      return done(null, user);
    });
  });