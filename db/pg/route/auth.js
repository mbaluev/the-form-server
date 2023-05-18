const express = require("express")
const router = express.Router()
const route = require("../controller/route/auth");
const passport = require("../passport");
const { verifyUser } = require("../passport/auth");
const routeUser = require("../controller/route/user");

router.post("/signin", passport.authenticate("local"), routeUser.initUser, route.signIn);
router.post("/signup", route.signUp);
router.post("/refreshToken", route.refreshToken)
router.post("/token", route.token)
router.get("/signout", verifyUser, route.signOut);

module.exports = router;