const express = require("express")
const router = express.Router()
const routeQuestion = require("../routes/question");
const { verifyAdmin, verifyStudent, verifyTables } = require("../passport/auth");

router.post("/list", verifyAdmin, routeQuestion.list);
router.get("/item/:id", verifyAdmin, routeQuestion.item);
router.post("/create", verifyAdmin, routeQuestion.create);
router.patch("/update/:id", verifyAdmin, routeQuestion.update);
router.delete("/delete", verifyAdmin, routeQuestion.del);

router.post("/user/list", verifyStudent, verifyTables, routeQuestion.userList);
router.get("/user/item/:id", verifyStudent, verifyTables, routeQuestion.userItem);
router.post("/user/save", verifyStudent, verifyTables, routeQuestion.userSave);
router.post("/user/check", verifyStudent, verifyTables, routeQuestion.userCheck);

router.post("/admin/list", verifyAdmin, verifyTables, routeQuestion.adminList);
router.get("/admin/item/:id", verifyAdmin, verifyTables, routeQuestion.adminItem);
router.post("/admin/save", verifyAdmin, verifyTables, routeQuestion.adminSave);

module.exports = router