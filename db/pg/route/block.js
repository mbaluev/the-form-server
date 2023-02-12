const express = require("express")
const router = express.Router()

const route = require("../controller/route/block");
const { verifyAdmin } = require("../passport/auth");

router.post("/list", verifyAdmin, route.getBlocks);
router.get("/get/:id", verifyAdmin, route.getBlock);
router.post("/create", verifyAdmin, route.createBlock);
router.patch("/update/:id", verifyAdmin, route.updateBlock);
router.delete("/delete", verifyAdmin, route.deleteBlocks);

module.exports = router