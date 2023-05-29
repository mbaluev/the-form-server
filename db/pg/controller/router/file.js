const express = require("express")
const router = express.Router()

const route = require("../routes/file");
const { verifyUser } = require("../../passport/auth");

const multer  = require('multer')
const uuid = require("uuid");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './files')
  },
  filename: function (req, file, cb) {
    const fileName = uuid.v4();
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
    cb(null, fileName);
  },
})
const upload = multer({ storage: storage })

router.post("/upload", verifyUser, upload.single('file'), route.upload);
router.get("/download/:id", verifyUser, route.download);

module.exports = router