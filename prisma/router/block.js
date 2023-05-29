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

module.exports = router