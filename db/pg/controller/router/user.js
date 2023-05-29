const express = require("express")
const router = express.Router()
const route = require("../routes/user");
const { verifyAdmin, verifyUser } = require("../../passport/auth");

router.post("/list", verifyAdmin, route.getUsers);
router.get("/get/:id", verifyAdmin, route.getUser);
router.post("/create", verifyAdmin, route.createUser);
router.patch("/update/:id", verifyAdmin, route.updateUser);
router.delete("/delete", verifyAdmin, route.deleteUsers);
router.get("/me", verifyUser, route.getMe);

module.exports = router
