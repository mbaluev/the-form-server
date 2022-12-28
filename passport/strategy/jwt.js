const db = require("../../db/utils/init");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = process.env.JWT_SECRET

// Used by the authenticated requests to deserialize the user,
// i.e., to fetch user details from the JWT.
module.exports = new JwtStrategy(opts, function (jwt_payload, done) {
  const id = jwt_payload.id;
  db.get('SELECT * FROM users WHERE id = ?', id, function(err, user) {
    if (err) return done(err, false);
    if (!user) return done(null, false);
    return done(null, user);
  });
})
