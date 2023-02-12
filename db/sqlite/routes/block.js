const express = require("express")
const uuid = require("uuid");
const router = express.Router()

const db = require("../utils/init")
const { verifyAdmin } = require("../passport/auth")

router.post("/list", verifyAdmin, (req, res, next) => {
  const errors = []
  if (!req.body.moduleId) errors.push("No moduleId specified");
  if (errors.length) {
    res.status(400).json({
      success: false,
      message: errors.join(", ")
    })
    return;
  }
  const moduleId = req.body.moduleId || '';
  const search = req.body.search || '';
  let query = "SELECT id, moduleId, title, name FROM blocks WHERE (title LIKE ? OR name LIKE ?)";
  const params = ['%' + search + '%', '%' + search + '%'];
  if (moduleId) {
    query += " AND moduleId = ?";
    params.push(moduleId);
  }
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
router.get("/get/:id", verifyAdmin, (req, res, next) => {
  const query = "SELECT id, moduleId, title, name FROM blocks WHERE id = ?"
  const params = [req.params.id]
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
  if (!req.body.moduleId) {
    errors.push("No moduleId specified");
  }
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
    id: uuid.v4(),
    moduleId: req.body.moduleId,
    title: req.body.title,
    name: req.body.name,
  };
  const query ='INSERT INTO blocks (id, moduleId, title, name) VALUES (?,?,?,?)'
  const params = [data.id, data.moduleId, data.title, data.name];
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
    moduleId: req.body.moduleId,
    title: req.body.title,
    name: req.body.name,
  };
  const query = `UPDATE blocks SET
    moduleId = COALESCE(?,moduleId), 
    title = COALESCE(?,title), 
    name = COALESCE(?,name)
    WHERE id = ?`;
  const params = [data.moduleId, data.title, data.name, data.id];
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
  const query = 'DELETE FROM blocks WHERE id IN (?)';
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
