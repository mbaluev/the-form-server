const express = require("express")
const jwt = require("jsonwebtoken")
const router = express.Router()
const db = require("../db/utils/init")
const passport = require("../passport");

const { getToken, COOKIE_OPTIONS, getRefreshToken, verifyUser } = require("../passport/auth")
const crypto = require("crypto");
const cryptoPass = require("../db/utils/cryptoPass");
const { v4: guid } = require("uuid");

router.post('/login',
  passport.authenticate('local'), (req, res, next) => {
    const id = req.user.id;
    db.get('SELECT * FROM users WHERE id = ?', id, (err, user) => {
      if (err) {
        res.status(500)
        res.send({
          success: false,
          message: err.message
        })
        return;
      }
      if (!user) {
        res.statusCode = 401
        res.send("Unauthorized")
        return;
      }
      const token = getToken({ id, admin: Boolean(user.admin) })
      const refreshToken = getRefreshToken({ id })
      const query = 'UPDATE users set refreshToken = COALESCE(?,refreshToken) WHERE id = ?'
      const params = [refreshToken, id];
      db.run(query, params, (err, result) => {
        if (err) {
          res.status(500)
          res.send({
            success: false,
            message: err.message
          })
          return;
        }
        res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
        res.send({ success: true, token })
      });
    });
  });
router.post('/signup', (req, res) => {
  const errors = []
  if (!req.body.password) {
    errors.push("No password specified");
  }
  if (!req.body.username) {
    errors.push("No username specified");
  }
  if (errors.length) {
    res.status(400).send({
      success: false,
      message: errors.join(",")
    })
    return;
  }
  const username = req.body.username;
  const salt = crypto.randomBytes(16).toString('hex');
  const password = cryptoPass(salt, req.body.password);
  const id = guid();
  const admin = req.body.admin || false;
  const token = getToken({ id, admin: Boolean(admin) })
  const refreshToken = getRefreshToken({ id })
  const data = {
    id,
    username,
    active: req.body.active || false,
    paid: req.body.paid || false,
    admin,
    refreshToken
  };
  const query = 'INSERT INTO users (id, username, password, salt, active, paid, admin, refreshToken) VALUES (?,?,?,?,?,?,?,?)'
  const params = [data.id, data.username, password, salt, data.active, data.paid, data.admin, data.refreshToken];
  db.run(query, params, function (err, result) {
    if (err) {
      res.status(500).send({
        success: false,
        message: err.message
      })
      return;
    }
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    res.send({ success: true, token })
  });
});
router.post("/refreshToken", (req, res, next) => {
  const { signedCookies = {} } = req
  const { refreshToken } = signedCookies
  if (!refreshToken) {
    res.statusCode = 401
    res.send("Unauthorized")
    return;
  }
  const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
  const userId = payload.id
  db.get('SELECT * FROM users WHERE id = ?', userId, (err, user) => {
    if (err) {
      res.statusCode = 401
      res.send("Unauthorized")
      return;
    }
    if (!user) {
      res.statusCode = 401
      res.send("Unauthorized")
      return;
    }
    if (refreshToken !== user.refreshToken) {
      res.statusCode = 401
      res.send("Unauthorized")
      return;
    }
    const token = getToken({ id: userId, admin: Boolean(user.admin) })
    // If the refresh token exists, then create new one and replace it.
    const newRefreshToken = getRefreshToken({ id: userId })
    const query = 'UPDATE users set refreshToken = COALESCE(?,refreshToken) WHERE id = ?'
    const params = [newRefreshToken, userId];
    db.run(query, params, (err, result) => {
      if (err) {
        res.status(500)
        res.send({
          success: false,
          message: err.message
        })
        return;
      }
      res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS)
      res.send({ success: true, token })
    });
  });
})
router.get("/logout", verifyUser, (req, res, next) => {
  const userId = req.user.id
  db.get('SELECT * FROM users WHERE id = ?', userId, (err, user, next) => {
    if (err) next(err);
    if (!user) next();
    const query = 'UPDATE users set refreshToken = NULL WHERE id = ?'
    const params = [userId];
    db.run(query, params, (err, result) => {
      if (err) {
        res.status(500)
        res.send({
          success: false,
          message: err.message
        })
        return;
      }
      res.clearCookie("refreshToken", COOKIE_OPTIONS)
      res.send({ success: true })
    });
  });
})

module.exports = router
