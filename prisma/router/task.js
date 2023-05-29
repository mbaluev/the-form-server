const express = require("express")
const router = express.Router()
const routeTask = require("../routes/task");
const { verifyAdmin, verifyStudent} = require("../passport/auth");

router.post("/list", verifyAdmin, routeTask.list);
router.get("/item/:id", verifyAdmin, routeTask.item);
router.post("/create", verifyAdmin, routeTask.create);
router.patch("/update/:id", verifyAdmin, routeTask.update);
router.delete("/delete", verifyAdmin, routeTask.del);

router.post("/user/list", verifyStudent, routeTask.userList);
router.get("/user/item/:id", verifyStudent, routeTask.userItem);
router.post("/user/sent", verifyStudent, routeTask.userSent);

module.exports = router
