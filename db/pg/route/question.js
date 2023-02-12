const express = require("express")
const router = express.Router()

const route = require("../controller/route/question");
const { verifyAdmin } = require("../passport/auth");

router.post("/list", verifyAdmin, route.getQuestions);
router.get("/get/:id", verifyAdmin, route.getQuestion);
router.post("/create", verifyAdmin, route.createQuestion);
router.patch("/update/:id", verifyAdmin, route.updateQuestion);
router.delete("/delete", verifyAdmin, route.deleteQuestions);

module.exports = router