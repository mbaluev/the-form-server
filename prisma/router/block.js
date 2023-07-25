const express = require("express")
const router = express.Router()
const routeBlock = require("../routes/block");
const { verifyAdmin, verifyStudent } = require("../passport/auth");

router.post("/list", verifyAdmin, routeBlock.list);
router.post("/item/:id", verifyAdmin, routeBlock.item);
router.post("/create", verifyAdmin, routeBlock.create);
router.patch("/update/:id", verifyAdmin, routeBlock.update);
router.delete("/delete", verifyAdmin, routeBlock.del);

router.post("/user/item/:id", verifyStudent, routeBlock.userItem);

router.post("/admin/list", verifyAdmin, routeBlock.adminList);
router.post("/admin/item/:id", verifyAdmin, routeBlock.adminItem);

module.exports = router