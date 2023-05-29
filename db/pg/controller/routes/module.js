const uuid = require("uuid");
const pool = require("../../utils/pool");
const handlers = require("../../utils/handlers");
const moduleService = require("../service/module");

const getModules = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN')

    const search = req.body.search;
    const { modules } = await moduleService.getModules(client, search);

    await client.query('COMMIT')
    res.status(200).send({
      success: true,
      data: modules
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const getModule = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN')

    const id = req.params.id;
    const blockId = req.body.blockId;
    const { module } = blockId ?
      await moduleService.getModuleByBlockId(client, blockId) :
      await moduleService.getModule(client, id);

    await client.query('COMMIT')
    res.status(200).send({
      success: true,
      data: module
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const createModule = async (req, res) => {
  const client = await pool.connect();
  try {
    handlers.validateRequest(req, 'title', 'name', 'position');
    await client.query('BEGIN')

    const data = {
      id: uuid.v4(),
      title: req.body.title,
      name: req.body.name,
      position: req.body.position
    };
    const { module } = await moduleService.createModule(client, data);

    await client.query('COMMIT')
    res.status(200).send({
      success: true,
      data: module
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const updateModule = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN')

    const data = {
      id: req.params.id,
      title: req.body.title,
      name: req.body.name,
      position: req.body.position
    };
    const { module } = await moduleService.updateModule(client, data);

    await client.query('COMMIT')
    res.status(200).send({
      success: true,
      data: module
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const deleteModules = async (req, res) => {
  const client = await pool.connect();
  try {
    handlers.validateRequest(req, 'ids');
    await client.query('BEGIN')

    const ids = req.body.ids;
    await moduleService.deleteModules(client, ids);

    await client.query('COMMIT')
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

const getModulesUser = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN')

    const userId = req.user.id;
    const search = req.body.search;
    const { modules } = await moduleService.getModulesUser(client, userId, search);

    await client.query('COMMIT')
    res.status(200).send({
      success: true,
      data: modules
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const getModuleUser = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN')

    const id = req.params.id;
    const blockId = req.body.blockId;
    const userId = req.user.id;
    const { module } = blockId ?
      await moduleService.getModuleUserByBlockId(client, blockId, userId) :
      await moduleService.getModuleUser(client, id, userId)

    await client.query('COMMIT')
    res.status(200).send({
      success: true,
      data: module
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}

module.exports = {
  getModules,
  getModule,
  createModule,
  updateModule,
  deleteModules,

  getModulesUser,
  getModuleUser,
}