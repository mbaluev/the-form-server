const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = process.env.JWT_SECRET

module.exports = new JwtStrategy(opts, function (jwt_payload, done) {
  const id = jwt_payload.id;
  return prisma.user.findFirst({ where: { id, admin: true } })
    .then(user => {
      if (!user) return done(null, false);
      return done(null, user);
    })
    .catch(err => done(err, false))
});