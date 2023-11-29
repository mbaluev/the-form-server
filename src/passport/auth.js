const passport = require("passport")
const jwt = require("jsonwebtoken")
const routeUser = require("../routes/user");

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
  return jwt.sign(obj, process.env.TOKEN_SECRET, {
    expiresIn: eval(process.env.TOKEN_EXPIRY),
  })
}

exports.verifySignIn = [passport.authenticate('sign-in')]

exports.verifyUser = [passport.authenticate('jwt-user')]

exports.verifyStudent = [passport.authenticate('jwt-student')]

exports.verifyAdmin = [passport.authenticate('jwt-admin')]

exports.verifyTables = [
  routeUser.checkTables,
  routeUser.checkBlocksComplete,
  routeUser.checkModulesComplete,
  routeUser.nextModuleEnable,
  routeUser.nextBlockEnable,
]




