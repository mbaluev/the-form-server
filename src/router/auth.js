const express = require("express")
const router = express.Router()
const { verifySignIn, verifyUser } = require("../passport/auth");
const routeAuth = require("../routes/auth");

router.post("/signin", verifySignIn, routeAuth.signIn);
router.post("/signup", routeAuth.signUp);
router.get("/signout", verifyUser, routeAuth.signOut);

module.exports = router;