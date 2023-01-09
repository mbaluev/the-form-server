const express = require("express")
const router = express.Router()
const db = require("../db/utils/init")
const { v4: guid } = require("uuid");

const multer  = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './files')
  },
  filename: function (req, file, cb) {
    const fileName = guid();
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
    cb(null, fileName);
  }
})
const upload = multer({ storage: storage })

const { verifyUser } = require("../passport/auth")

router.post("/upload", verifyUser, upload.single('file'), (req, res, next) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({
      success: false,
      message: "No File is selected.",
    });
  }
  const data = {
    id: file.filename,
    name: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    path: file.path
  }
  const query ='INSERT INTO files (id, name, size, mimetype, path) VALUES (?,?,?,?,?)'
  const params = [data.id, data.name, data.size, data.mimetype, data.path];
  db.run(query, params, (err, rows) => {
    if (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
      return;
    }
    res.json({
      success: true,
      data
    });
  });
});
router.get("/download/:id", verifyUser, (req,res) => {
  const query ='SELECT name, path FROM files WHERE id = ?';
  const id = req.params.id;
  db.get(query, id, (err, file) => {
    if (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
      return;
    }
    res.download(file.path, file.name);
  });
});

module.exports = router
