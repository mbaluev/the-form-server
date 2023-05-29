const express = require("express")
const jwt = require("jsonwebtoken")
const crypto = require("crypto");
const uuid = require("uuid");

const router = express.Router()
const db = require("../utils/init")
const passport = require("../passport");
const { getToken, COOKIE_OPTIONS, getRefreshToken, verifyUser } = require("../passport/auth")
const cryptoPass = require("../../../prisma/utils/cryptoPass");

router.post('/signin',
  passport.authenticate('local'), (req, res, next) => {
    const query = 'SELECT id, firstname, lastname, username, active, paid, admin FROM users WHERE id = ?';
    const id = req.user.id;
    db.get(query, id, (err, user) => {
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
      const firstname = user.firstname;
      const lastname = user.lastname;
      const username = user.username;
      const token = getToken({ id, active, paid, admin, username, firstname, lastname });
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
  if (!req.body.firstname) {
    errors.push("No firstname specified");
  }
  if (!req.body.lastname) {
    errors.push("No lastname specified");
  }
  if (!req.body.username) {
    errors.push("No username specified");
  }
  if (!req.body.password) {
    errors.push("No password specified");
  }
  if (errors.length) {
    res.status(400).send({
      success: false,
      message: errors.join(", ")
    })
    return;
  }
  const id = uuid.v4();
  const salt = crypto.randomBytes(16).toString('hex');
  const password = cryptoPass(salt, req.body.password);
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const username = req.body.username;
  const active = Boolean(req.body.active) || false;
  const paid = Boolean(req.body.paid) || false;
  const admin = Boolean(req.body.admin) || false;
  const data = {
    id,
    firstname,
    lastname,
    username,
    active,
    paid,
    admin,
  };
  db.beginTransaction(async (err, transaction) => {
    const query1 = 'INSERT INTO users (id, firstname, lastname, username, password, salt, active, paid, admin) VALUES (?,?,?,?,?,?,?,?,?)'
    const params1 = [data.id, data.firstname, data.lastname, data.username, password, salt, data.active, data.paid, data.admin];
    transaction.run(query1, params1);

    const query2 = 'SELECT id FROM modules ORDER BY position';
    const modules = await transaction.allAsync(query2);

    const query3 = 'INSERT INTO userModules (id, moduleId, userId, enable, complete) VALUES (?,?,?,?,?)'
    const params3 = [uuid.v4(), modules[0].id, data.id, 1, 0];
    transaction.run(query3, params3);

    transaction.commit((err) => {
      if (err) {
        res.status(400).json({
          success: false,
          message: err.message
        })
        return;
      }
      res.json({ success: true })
    });
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
  const query = 'SELECT id, firstname, lastname, username, active, paid, admin, refreshToken FROM users WHERE id = ?';
  const id = payload.id
  db.get(query, id, (err, user) => {
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
    const firstname = user.firstname;
    const lastname = user.lastname;
    const username = user.username;
    const token = getToken({ id, active, paid, admin, username, firstname, lastname });
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
router.post("/token", (req, res, next) => {
  const { signedCookies = {} } = req
  const { refreshToken } = signedCookies
  if (!refreshToken) {
    res.statusCode = 401
    res.send("Unauthorized")
    return;
  }
  const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
  const query = 'SELECT id, firstname, lastname, username, active, paid, admin, refreshToken FROM users WHERE id = ?';
  const id = payload.id
  db.get(query, id, (err, user) => {
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
    const firstname = user.firstname;
    const lastname = user.lastname;
    const username = user.username;
    const token = getToken({ id, active, paid, admin, username, firstname, lastname });
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    res.send({ success: true, token })
  });
})
router.get("/signout", verifyUser, (req, res, next) => {
  const query = 'SELECT id FROM users WHERE id = ?';
  const userId = req.user.id
  db.get(query, userId, (err, user, next) => {
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
