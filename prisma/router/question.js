const express = require("express")
const router = express.Router()
const routeQuestion = require("../routes/question");
const { verifyAdmin, verifyStudent} = require("../passport/auth");

router.post("/list", verifyAdmin, routeQuestion.list);
router.get("/item/:id", verifyAdmin, routeQuestion.item);
router.post("/create", verifyAdmin, routeQuestion.create);
router.patch("/update/:id", verifyAdmin, routeQuestion.update);
router.delete("/delete", verifyAdmin, routeQuestion.del);

router.post("/user/list", verifyStudent, routeQuestion.userList);
router.get("/user/item/:id", verifyAdmin, routeQuestion.userItem);
router.post("/user/save", verifyStudent, routeQuestion.userSave);
router.post("/user/check", verifyStudent, routeQuestion.userCheck);

router.post("/admin/list", verifyAdmin, routeQuestion.adminList);
router.get("/admin/item/:id", verifyAdmin, routeQuestion.adminItem);

module.exports = router