const express = require("express")
const router = express.Router()
const routeDocumentType = require("../routes/documentType");

router.get("/list", routeDocumentType.list);

module.exports = router