const passport = require("passport")
const jwt = require("jsonwebtoken")
const dev = process.env.NODE_ENV !== "production"

exports.COOKIE_OPTIONS = {
  httpOnly: true,
  // Since localhost is not having https protocol, secure cookies do not work correctly (in postman)
  signed: true,
  maxAge: eval(process.env.REFRESH_TOKEN_EXPIRY) * 1000,
  secure: true,
  sameSite: "none",
}

exports.getToken = user => {
  const roles = ['user'];
  if (user.admin) roles.push('admin');
  if (user.active && user.paid) roles.push('student');
  const obj = {
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    username: user.username,
    roles
  };
  return jwt.sign(obj, process.env.JWT_SECRET, {
    expiresIn: eval(process.env.SESSION_EXPIRY),
  })
}

exports.getRefreshToken = user => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: eval(process.env.REFRESH_TOKEN_EXPIRY),
  })
}

exports.verifyUser = passport.authenticate('jwt-user', { session: false })

exports.verifyStudent = passport.authenticate('jwt-student', { session: false })

exports.verifyAdmin = passport.authenticate('jwt-admin', { session: false })
