const express = require("express")
const router = express.Router()
const routeMaterial = require("../routes/material");
const { verifyAdmin, verifyStudent} = require("../passport/auth");

router.post("/list", verifyAdmin, routeMaterial.list);
router.get("/item/:id", verifyAdmin, routeMaterial.item);
router.post("/create", verifyAdmin, routeMaterial.create);
router.patch("/update/:id", verifyAdmin, routeMaterial.update);
router.delete("/delete", verifyAdmin, routeMaterial.del);

router.post("/user/list", verifyStudent, routeMaterial.userList);
router.get("/user/item/:id", verifyStudent, routeMaterial.userItem);
router.post("/user/update/:id", verifyStudent, routeMaterial.userUpdate);

module.exports = router
