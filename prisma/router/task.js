const express = require("express")
const router = express.Router()
const routeTask = require("../routes/task");
const { verifyAdmin, verifyStudent, verifyTables } = require("../passport/auth");

router.post("/list", verifyAdmin, routeTask.list);
router.get("/item/:id", verifyAdmin, routeTask.item);
router.post("/create", verifyAdmin, routeTask.create);
router.patch("/update/:id", verifyAdmin, routeTask.update);
router.delete("/delete", verifyAdmin, routeTask.del);

router.post("/user/list", verifyStudent, verifyTables, routeTask.userList);
router.get("/user/item/:id", verifyStudent, verifyTables, routeTask.userItem);
router.post("/user/sent", verifyStudent, verifyTables, routeTask.userSent);

router.post("/admin/list", verifyAdmin, verifyTables, routeTask.adminList);
router.get("/admin/item/:id", verifyAdmin, verifyTables, routeTask.adminItem);
router.post("/admin/sent", verifyAdmin, verifyTables, routeTask.adminSent);
router.post("/admin/complete/:id", verifyAdmin, verifyTables, routeTask.adminComplete);

module.exports = router
