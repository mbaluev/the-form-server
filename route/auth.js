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
    db.get('SELECT id, username, active, paid, admin FROM users WHERE id = ?', id, (err, user) => {
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
      const active = Boolean(user.active);
      const paid = Boolean(user.paid);
      const admin = Boolean(user.admin);
      const username = user.username;
      const token = getToken({ id, active, paid, admin, username });
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
  const id = guid();
  const salt = crypto.randomBytes(16).toString('hex');
  const password = cryptoPass(salt, req.body.password);
  const username = req.body.username;
  const active = Boolean(req.body.active) || false;
  const paid = Boolean(req.body.paid) || false;
  const admin = Boolean(req.body.admin) || false;
  const token = getToken({ id, active, paid, admin, username })
  const refreshToken = getRefreshToken({ id })
  const data = {
    id,
    username,
    active,
    paid,
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
  const id = payload.id
  db.get('SELECT id, username, active, paid, admin, refreshToken FROM users WHERE id = ?', id, (err, user) => {
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
    const active = Boolean(user.active);
    const paid = Boolean(user.paid);
    const admin = Boolean(user.admin);
    const username = user.username;
    const token = getToken({ id, active, paid, admin, username });
    // If the refresh token exists, then create new one and replace it.
    const newRefreshToken = getRefreshToken({ id })
    const query = 'UPDATE users set refreshToken = COALESCE(?,refreshToken) WHERE id = ?'
    const params = [newRefreshToken, id];
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
