const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const db = require("../../utils/init")

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = process.env.JWT_SECRET

module.exports = new JwtStrategy(opts, function (jwt_payload, done) {
  const id = jwt_payload.id;
  const query = "SELECT id, firstname, lastname, username, active, paid, admin FROM users WHERE id = ?"
  const params = [id];
  db.get(query, params, function(err, user) {
    if (err) return done(err, false);
    if (!user) return done(null, false);
    return done(null, user);
  });
});