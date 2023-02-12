const express = require("express")
const router = express.Router()

const route = require("../controller/route/module");
const { verifyAdmin, verifyStudent } = require("../passport/auth");

router.post("/list", verifyAdmin, route.getModules);
router.post("/get/:id", verifyAdmin, route.getModule);
router.post("/create", verifyAdmin, route.createModule);
router.patch("/update/:id", verifyAdmin, route.updateModule);
router.delete("/delete", verifyAdmin, route.deleteModules);

router.post("/list/user", verifyStudent, route.getModulesUser);

module.exports = router
