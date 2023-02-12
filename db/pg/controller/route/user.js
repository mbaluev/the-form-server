const uuid = require("uuid");
const pool = require("../../utils/pool");
const handlers = require("../../utils/handlers");
const userService = require("../../controller/service/user");
const crypto = require("crypto");
const cryptoPass = require("../../../../utils/cryptoPass");

const getUsers = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN')

    const search = req.body.search;
    const { users } = await userService.getUsers(client, search);

    await client.query('COMMIT')
    res.status(200).send({
      success: true,
      data: users
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const getUser = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN')

    const id = req.params.id;
    const { user } = await userService.getUser(client, id);
    const { password, salt, refreshToken, ...userResponse } = user

    await client.query('COMMIT')
    res.status(200).send({
      success: true,
      data: userResponse
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const createUser = async (req, res) => {
  const client = await pool.connect();
  try {
    handlers.validateRequest(req, 'firstname', 'lastname', 'username', 'password');
    await client.query('BEGIN')

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
    const { user } = await userService.createUser(client, dataUser);
    const { password, salt, refreshToken, ...userResponse } = user

    await client.query('COMMIT')
    res.status(200).send({
      success: true,
      data: userResponse
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const updateUser = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN')

    const data = {
      id: req.params.id,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.username,
      active: req.body.active,
      paid: req.body.paid,
      admin: req.body.admin
    };
    const { user } = await userService.updateUser(client, data);
    const { password, salt, refreshToken, ...userResponse } = user

    await client.query('COMMIT')
    res.status(200).send({
      success: true,
      data: userResponse
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const deleteUsers = async (req, res) => {
  const client = await pool.connect();
  try {
    handlers.validateRequest(req, 'ids');
    await client.query('BEGIN');

    const ids = req.body.ids;
    await userService.deleteUsers(client, ids);

    await client.query('COMMIT');
    res.status(200).send({
      success: true,
      changes: ids.length
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const getMe = async (req, res) => {
  res.send(req.user);
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUsers,
  getMe
}