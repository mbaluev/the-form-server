const express = require("express")
const router = express.Router()

const route = require("../controller/route/task");
const { verifyAdmin } = require("../passport/auth");

router.post("/list", verifyAdmin, route.getTasks);
router.get("/get/:id", verifyAdmin, route.getTask);
router.post("/create", verifyAdmin, route.createTask);
router.patch("/update/:id", verifyAdmin, route.updateTask);
router.delete("/delete", verifyAdmin, route.deleteTasks);

module.exports = router