const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const passport = require('passport');

const signInStrategy = require('./strategy/sign-in');
const jwtUserStrategy = require('./strategy/jwt-user');
const jwtAdminStrategy = require('./strategy/jwt-admin');
const jwtStudentStrategy = require('./strategy/jwt-student');

passport.serializeUser((user, done) => {
  return done(null, user.id);
});
passport.deserializeUser((id, done) => {
  return prisma.user.findUniqueOrThrow({ where: { id } })
    .then(user => done(null, user))
    .catch(err => done(err, false))
});

passport.use('sign-in', signInStrategy);
passport.use('jwt-user', jwtUserStrategy);
passport.use('jwt-admin', jwtAdminStrategy);
passport.use('jwt-student', jwtStudentStrategy);

module.exports = passport;