const express = require("express")
const router = express.Router()

const route = require("../routes/question");
const { verifyAdmin, verifyStudent} = require("../../passport/auth");

router.post("/list", verifyAdmin, route.getQuestions);
router.get("/get/:id", verifyAdmin, route.getQuestion);
router.post("/create", verifyAdmin, route.createQuestion);
router.patch("/update/:id", verifyAdmin, route.updateQuestion);
router.delete("/delete", verifyAdmin, route.deleteQuestions);

router.post("/user/list", verifyStudent, route.getQuestionsUser);
router.post("/user/check", verifyStudent, route.checkQuestionsUser);

module.exports = router