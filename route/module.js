const express = require("express")
const router = express.Router()
const db = require("../db/utils/init")

const { v4: guid } = require("uuid");
const { verifyAdmin } = require("../passport/auth")

router.post("/list", verifyAdmin, (req, res, next) => {
  const search = req.body.search || '';
  const query = "SELECT id, title, name FROM modules WHERE title LIKE ? OR name LIKE ?"
  const params = ['%' + search + '%', '%' + search + '%'];
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
      return;
    }
    res.json({
      success: true,
      data: rows
    })
  });
});
router.post("/get/:id", verifyAdmin, (req, res, next) => {
  const id = req.params.id;
  const blockId = req.body.blockId;
  let query;
  let params;
  if (blockId) {
    query = "SELECT m.id, m.title, m.name FROM modules m INNER JOIN blocks b ON b.moduleId = m.id WHERE b.id = ?"
    params = [blockId];
  } else {
    query = "SELECT id, title, name from modules WHERE id = ?";
    params = [id];
  }
  db.get(query, params, (err, row) => {
    if (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
      return;
    }
    res.json({
      success: true,
      data: row
    })
  });
});
router.post("/create", verifyAdmin, (req, res, next) => {
  const errors = []
  if (!req.body.title) {
    errors.push("No title specified");
  }
  if (!req.body.name) {
    errors.push("No name specified");
  }
  if (errors.length) {
    res.status(400).json({
      success: false,
      message: errors.join(", ")
    })
    return;
  }
  const data = {
    id: guid(),
    title: req.body.title,
    name: req.body.name,
  };
  const query ='INSERT INTO modules (id, title, name) VALUES (?,?,?)'
  const params = [data.id, data.title, data.name];
  db.run(query, params, function (err, result) {
    if (err){
      res.status(400).json({
        success: false,
        message: err.message
      })
      return;
    }
    res.json({
      success: true,
      data: { id : this.lastID, ...data }
    })
  });
});
router.patch("/update/:id", verifyAdmin, (req, res, next) => {
  const data = {
    id: req.params.id,
    title: req.body.title,
    name: req.body.name,
  };
  const query = `UPDATE modules set 
    title = COALESCE(?,title), 
    name = COALESCE(?,name)
    WHERE id = ?`;
  const params = [data.title, data.name, data.id];
  db.run(query, params, function (err, result) {
    if (err){
      res.status(400).json({
        success: false,
        message: err.message
      })
      return;
    }
    res.json({
      success: true,
      changes: this.changes,
      data: data
    })
  });
})
router.delete("/delete", verifyAdmin, (req, res, next) => {
  const query = 'DELETE FROM modules WHERE id IN (?)';
  const params = req.body.ids.join(',');
  db.run(query, params, function (err, result) {
    if (err){
      res.status(400).json({
        success: false,
        message: err.message,
      })
      return;
    }
    res.json({
      success: true,
      changes: this.changes,
    })
  });
})

module.exports = router
