const express = require("express")
const router = express.Router()
const routeMaterial = require("../routes/material");
const { verifyAdmin, verifyStudent, verifyTables } = require("../passport/auth");

router.post("/list", verifyAdmin, routeMaterial.list);
router.get("/item/:id", verifyAdmin, routeMaterial.item);
router.post("/create", verifyAdmin, routeMaterial.create);
router.patch("/update/:id", verifyAdmin, routeMaterial.update);
router.delete("/delete", verifyAdmin, routeMaterial.del);

router.post("/user/list", verifyStudent, verifyTables, routeMaterial.userList);
router.get("/user/item/:id", verifyStudent, verifyTables, routeMaterial.userItem);
router.post("/user/update/:id", verifyStudent, verifyTables, routeMaterial.userUpdate);

router.post("/admin/list", verifyAdmin, verifyTables, routeMaterial.adminList);
router.get("/admin/item/:id", verifyAdmin, verifyTables, routeMaterial.adminItem);

module.exports = router
