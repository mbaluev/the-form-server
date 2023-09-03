const handlers = require("../utils/handlers");
const crypto = require("crypto");
const cryptoPass = require("../utils/cryptoPass");
const { COOKIE_OPTIONS } = require("../passport/auth")
const { getToken, getRefreshToken } = require("../passport/auth");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const signIn = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await prisma.user.findUniqueOrThrow({
      where: { id }
    });
    const token = getToken({
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      active: user.active,
      paid: user.paid,
      admin: user.admin
    });
    const refreshToken = getRefreshToken({ id })
    await prisma.userRefreshToken.create({
      data: {
        token: refreshToken,
        userId: id
      }
    })
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    res.status(200).send({
      success: true,
      token
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const signUp = async (req, res) => {
  try {
    handlers.validateRequest(req, 'firstname', 'lastname', 'username', 'password');
    const dataSalt = crypto.randomBytes(16).toString('hex');
    const dataPassword = cryptoPass(dataSalt, req.body.password);
    await prisma.user.create({
      data: {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        password: dataPassword,
        salt: dataSalt,
        active: req.body.active || false,
        paid: req.body.paid || false,
        admin: req.body.admin || false
      }
    })
    res.status(200).send({
      success: true
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const signOut = async (req, res) => {
  try {
    const id = req.user.id;
    await prisma.user.findUniqueOrThrow({
      where: { id }
    })
    await prisma.userRefreshToken.deleteMany({
      where: { userId: id },
    })
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    res.status(200).send({
      success: true
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const token = async (req, res) => {
  try {
    const { signedCookies: { refreshToken } } = req
    const user = await authorize(refreshToken);
    const newToken = getToken({
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      active: user.active,
      paid: user.paid,
      admin: user.admin
    });
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    res.status(200).send({
      success: true,
      token: newToken
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const refreshToken = async (req, res) => {
  try {
    const { signedCookies: { refreshToken } } = req
    const user = await authorize(refreshToken);
    const newToken = getToken({
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      active: user.active,
      paid: user.paid,
      admin: user.admin
    });
    const newRefreshToken = getRefreshToken({ id: user.id })
    await prisma.userRefreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id
      }
    })
    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS)
    res.status(200).send({
      success: true,
      token: newToken
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}

const authorize = async (refreshToken) => {
  if (!refreshToken) handlers.throwError(401, "Unauthorized");
  const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  const id = payload.id;
  const user = await prisma.user.findUniqueOrThrow({
    where: { id }
  });
  const userRefreshTokens = await prisma.userRefreshToken.findMany({
    where: { userId: id}
  })
  let authorized = false;
  for (const userRefreshToken of userRefreshTokens) {
    jwt.verify(userRefreshToken.token, process.env.REFRESH_TOKEN_SECRET, (err) => {
      if (err) {
        prisma.userRefreshToken.delete({
          where: { id: userRefreshToken.id }
        })
      } else {
        if (userRefreshToken.token === refreshToken)
          authorized = true
      }
    });
  }
  if (!authorized) handlers.throwError(401, "Unauthorized");
  return user;
}

module.exports = {
  signIn,
  signUp,
  signOut,
  token,
  refreshToken
}