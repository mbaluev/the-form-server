const handlers = require("../utils/handlers");
const crypto = require("crypto");
const cryptoPass = require("../utils/cryptoPass");
const { getToken } = require("../passport/auth");
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
    await prisma.userRefreshToken.deleteMany({
      where: { userId: id },
    })
    await prisma.userRefreshToken.create({
      data: {
        token: token,
        userId: id
      }
    })
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
    res.status(200).send({
      success: true
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}

module.exports = {
  signIn,
  signUp,
  signOut,
}