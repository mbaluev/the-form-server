const LocalStrategy = require('passport-local');
const cryptoPass = require("../../utils/cryptoPass");
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  (username, password, done) => {
    return prisma.user.findFirst({ where: { username: username } })
      .then(user => {
        if (!user) return done(null, false);
        const hashedPassword = cryptoPass(user.salt, password);
        if (user.password !== hashedPassword) return done(null, false);
        return done(null, user);
      })
      .catch(err => done(err, false))
});