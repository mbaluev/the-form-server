const express = require("express")
const router = express.Router()

const route = require("../routes/task");
const { verifyAdmin, verifyStudent } = require("../../passport/auth");

router.post("/list", verifyAdmin, route.getTasks);
router.get("/get/:id", verifyAdmin, route.getTask);
router.post("/create", verifyAdmin, route.createTask);
router.patch("/update/:id", verifyAdmin, route.updateTask);
router.delete("/delete", verifyAdmin, route.deleteTasks);

router.post("/user/list", verifyStudent, route.getTasksUser);
router.get("/user/get/:id", verifyStudent, route.getTaskUser);

module.exports = router