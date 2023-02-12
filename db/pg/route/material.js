const express = require("express")
const router = express.Router()

const route = require("../controller/route/material");
const { verifyAdmin } = require("../passport/auth");

router.post("/list", verifyAdmin, route.getMaterials);
router.get("/get/:id", verifyAdmin, route.getMaterial);
router.post("/create", verifyAdmin, route.createMaterial);
router.patch("/update/:id", verifyAdmin, route.updateMaterial);
router.delete("/delete", verifyAdmin, route.deleteMaterials);

module.exports = router
