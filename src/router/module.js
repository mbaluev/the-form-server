const express = require("express")
const router = express.Router()
const routeModule = require("../routes/module");
const { verifyUser,verifyAdmin, verifyStudent, verifyTables } = require("../passport/auth");

router.post("/list", verifyAdmin, routeModule.list);
router.post("/item/:id", verifyAdmin, routeModule.item);
router.post("/create", verifyAdmin, routeModule.create);
router.patch("/update/:id", verifyAdmin, routeModule.update);
router.delete("/delete", verifyAdmin, routeModule.del);

router.post("/user/list", verifyStudent, verifyTables, routeModule.userList);
router.post("/user/item/:id", verifyStudent, verifyTables, routeModule.userItem);
router.post("/user/blockId/:id", verifyUser, verifyTables, routeModule.userBlockId);

router.post("/admin/list", verifyAdmin, verifyTables, routeModule.adminList);
router.post("/admin/item/:id", verifyAdmin, verifyTables, routeModule.adminItem);

module.exports = router
