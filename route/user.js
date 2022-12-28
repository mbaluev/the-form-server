const express = require("express")
const router = express.Router()
const db = require("../db/utils/init")

const crypto = require("crypto");
const cryptoPass = require("../db/utils/cryptoPass");
const { v4: guid } = require("uuid");
const { verifyUser } = require("../passport/auth")

router.get("/list", (req, res, next) => {
  const search = req.body.search || '';
  const query = "SELECT id, username, active, paid, admin FROM users WHERE username LIKE ?"
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
router.get("/get/:id", (req, res, next) => {
  const query = "select id, username, active, paid, admin from users where id = ?"
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
router.post("/create", (req, res, next) => {
  const errors = []
  if (!req.body.password){
    errors.push("No password specified");
  }
  if (!req.body.username){
    errors.push("No username specified");
  }
  if (errors.length){
    res.status(400).json({
      success: false,
      message: errors.join(",")
    })
    return;
  }
  const username = req.body.username;
  const salt = crypto.randomBytes(16).toString('hex');
  const password = cryptoPass(salt, req.body.password);
  const data = {
    id: guid(),
    username,
    active: req.body.active || false,
    paid: req.body.paid || false,
    admin: req.body.admin || false
  };
  const query ='INSERT INTO users (id, username, password, salt, active, paid, admin) VALUES (?,?,?,?,?,?,?)'
  const params = [data.id, data.username, password, salt, data.active, data.paid, data.admin];
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
router.patch("/update/:id", (req, res, next) => {
  const username = req.body.username;
  const data = {
    id: req.params.id,
    username,
    active: req.body.active,
    paid: req.body.paid,
    admin: req.body.admin
  };
  db.run(`UPDATE users set 
           username = COALESCE(?,username), 
           active = COALESCE(?,active),
           paid = COALESCE(?,paid),
           admin = COALESCE(?,admin)
           WHERE id = ?`,
    [data.username, data.active, data.paid, data.admin, data.id],
    function (err, result) {
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
router.delete("/delete", (req, res, next) => {
  const ids = req.body.ids.join(',');
  db.run('DELETE FROM users WHERE id IN (?)', ids, function (err, result) {
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
