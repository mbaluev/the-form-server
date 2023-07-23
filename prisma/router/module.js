const express = require("express")
const router = express.Router()
const routeModule = require("../routes/module");
const { verifyAdmin, verifyStudent } = require("../passport/auth");

router.post("/list", verifyAdmin, routeModule.list);
router.post("/item/:id", verifyAdmin, routeModule.item);
router.post("/create", verifyAdmin, routeModule.create);
router.patch("/update/:id", verifyAdmin, routeModule.update);
router.delete("/delete", verifyAdmin, routeModule.del);

router.post("/user/list", verifyStudent, routeModule.userList);
router.post("/user/item/:id", verifyStudent, routeModule.userItem);

router.post("/admin/list", verifyAdmin, routeModule.adminList);
router.post("/admin/item/:id", verifyAdmin, routeModule.adminItem);

module.exports = router
