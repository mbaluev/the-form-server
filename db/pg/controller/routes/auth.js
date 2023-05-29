const uuid = require("uuid");
const pool = require("../../utils/pool");
const handlers = require("../../utils/handlers");
const authService = require("../service/auth");
const crypto = require("crypto");
const cryptoPass = require("../../../../prisma/utils/cryptoPass");
const { COOKIE_OPTIONS } = require("../../passport/auth")

const signIn = async (req, res) => {
  const client = await pool.connect();
  try {
    const id = req.user.id;
    await client.query('BEGIN');

    const { token, refreshToken } = await authService.signIn(client, id);

    await client.query('COMMIT');
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    res.status(200).send({
      success: true,
      token
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const signUp = async (req, res) => {
  const client = await pool.connect();
  try {
    validateRequest(req, 'firstname', 'lastname', 'username', 'password');
    await client.query('BEGIN');

    const dataSalt = crypto.randomBytes(16).toString('hex');
    const dataPassword = cryptoPass(dataSalt, req.body.password);
    const dataUser = {
      id: uuid.v4(),
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.username,
      password: dataPassword,
      salt: dataSalt,
      active: req.body.active || false,
      paid: req.body.paid || false,
      admin: req.body.admin || false
    };
    await authService.signUp(client, dataUser);

    await client.query('COMMIT');
    res.status(200).send({
      success: true
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const signOut = async (req, res) => {
  const client = await pool.connect();
  try {
    const id = req.user.id;
    await client.query('BEGIN');

    await authService.signOut(client, id);

    await client.query('COMMIT');
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    res.status(200).send({
      success: true
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const token = async (req, res) => {
  const client = await pool.connect();
  try {
    const { signedCookies = {} } = req
    const { refreshToken } = signedCookies
    await client.query('BEGIN');

    const { newToken } = await authService.token(client, refreshToken);

    await client.query('COMMIT');
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    res.status(200).send({
      success: true,
      token: newToken
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const refreshToken = async (req, res) => {
  const client = await pool.connect();
  try {
    const { signedCookies = {} } = req
    const { refreshToken } = signedCookies
    await client.query('BEGIN');

    const { newToken, newRefreshToken } = await authService.refreshToken(client, refreshToken);

    await client.query('COMMIT');
    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS)
    res.status(200).send({
      success: true,
      token: newToken
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}

module.exports = {
  signIn,
  signUp,
  signOut,
  token,
  refreshToken
}