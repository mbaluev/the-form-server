const express = require("express")
const router = express.Router()

const route = require("../routes/module");
const { verifyAdmin, verifyStudent } = require("../../passport/auth");

router.post("/list", verifyAdmin, route.getModules);
router.post("/get/:id", verifyAdmin, route.getModule);
router.post("/create", verifyAdmin, route.createModule);
router.patch("/update/:id", verifyAdmin, route.updateModule);
router.delete("/delete", verifyAdmin, route.deleteModules);

router.post("/user/list", verifyStudent, route.getModulesUser);
router.post("/user/get/:id", verifyStudent, route.getModuleUser);

module.exports = router
