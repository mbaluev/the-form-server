const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const pool = require("../../utils/pool");

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = process.env.JWT_SECRET

module.exports = new JwtStrategy(opts, function (jwt_payload, done) {
  const id = jwt_payload.id;
  const query = `SELECT id, firstname, lastname, username, active, paid, admin FROM users WHERE id = $1 and admin = true`;
  const params = [id];
  pool.query(query, params, (err, res) => {
    if (err) return done(err, false);
    if (res.rowCount === 0) return done(null, false);
    const user = res.rows[0];
    return done(null, user);
  })
});