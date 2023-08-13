const express = require("express")
const router = express.Router()
const routeUser = require("../routes/user");
const { verifyAdmin, verifyUser, verifyTables } = require("../passport/auth");

router.post("/list", verifyAdmin, routeUser.list);
router.get("/item/:id", verifyAdmin, routeUser.item);
router.post("/create", verifyAdmin, routeUser.create);
router.patch("/update/:id", verifyAdmin, routeUser.update);
router.delete("/delete", verifyAdmin, routeUser.del);
router.get("/me", verifyUser, routeUser.me);

router.post("/admin/list", verifyAdmin, verifyTables, routeUser.adminList);

module.exports = router
