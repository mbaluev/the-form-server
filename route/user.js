const express = require("express")
const router = express.Router()
const db = require("../db/utils/init")

const crypto = require("crypto");
const cryptoPass = require("../db/utils/cryptoPass");
const { v4: guid } = require("uuid");
const { verifyUser, verifyAdmin } = require("../passport/auth")

router.post("/list", verifyAdmin, (req, res, next) => {
  const search = req.body.search || '';
  const query = "SELECT id, firstname, lastname, username, active, paid, admin FROM users WHERE username LIKE ?"
  const params = ['%' + search + '%'];
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
  const query = "SELECT id, firstname, lastname, username, active, paid, admin FROM users WHERE id = ?"
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
  if (!req.body.firstname){
    errors.push("No firstname specified");
  }
  if (!req.body.lastname){
    errors.push("No lastname specified");
  }
  if (!req.body.username){
    errors.push("No username specified");
  }
  if (!req.body.password){
    errors.push("No password specified");
  }
  if (errors.length){
    res.status(400).json({
      success: false,
      message: errors.join(", ")
    })
    return;
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const password = cryptoPass(salt, req.body.password);
  const data = {
    id: guid(),
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    username: req.body.username,
    active: req.body.active || false,
    paid: req.body.paid || false,
    admin: req.body.admin || false
  };
  const query ='INSERT INTO users (id, firstname, lastname, username, password, salt, active, paid, admin) VALUES (?,?,?,?,?,?,?,?,?)'
  const params = [data.id, data.firstname, data.lastname, data.username, password, salt, data.active, data.paid, data.admin];
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
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    username: req.body.username,
    active: req.body.active,
    paid: req.body.paid,
    admin: req.body.admin
  };
  const query = `UPDATE users set 
    firstname = COALESCE(?,firstname), 
    lastname = COALESCE(?,lastname), 
    username = COALESCE(?,username), 
    active = COALESCE(?,active),
    paid = COALESCE(?,paid),
    admin = COALESCE(?,admin)
    WHERE id = ?`;
  const params = [data.username, data.firstname, data.lastname, data.active, data.paid, data.admin, data.id];
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
  const query = 'DELETE FROM users WHERE id IN (?)';
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
router.get("/me", verifyUser, (req, res, next) => {
  res.send(req.user)
})

module.exports = router
