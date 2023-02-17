const express = require("express")
const router = express.Router()

const route = require("../controller/route/block");
const { verifyAdmin, verifyStudent } = require("../passport/auth");

router.post("/list", verifyAdmin, route.getBlocks);
router.post("/get/:id", verifyAdmin, route.getBlock);
router.post("/create", verifyAdmin, route.createBlock);
router.patch("/update/:id", verifyAdmin, route.updateBlock);
router.delete("/delete", verifyAdmin, route.deleteBlocks);

router.post("/list/user", verifyStudent, route.getBlocksUser);
router.post("/get/user/:id", verifyStudent, route.getBlockUser);

module.exports = router