const uuid = require("uuid");
const pool = require("../../utils/pool");
const handlers = require("../../utils/handlers");
const blockService = require("../service/block");

const getBlocks = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const search = req.body.search;
    const moduleId = req.body.moduleId;
    const { blocks } = moduleId ?
      await blockService.getBlocksByModuleId(client, moduleId, search) :
      await blockService.getBlocks(client, search);

    await client.query('COMMIT');
    res.status(200).send({
      success: true,
      data: blocks
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const getBlock = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const id = req.params.id;
    const { block } = await blockService.getBlock(client, id);

    await client.query('COMMIT');
    res.status(200).send({
      success: true,
      data: block
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const createBlock = async (req, res) => {
  const client = await pool.connect();
  try {
    handlers.validateRequest(req, 'moduleId', 'title', 'name', 'position');
    await client.query('BEGIN');

    const data = {
      id: uuid.v4(),
      moduleId: req.body.moduleId,
      title: req.body.title,
      name: req.body.name,
      position: req.body.position,
    };
    const { block } = await blockService.createBlock(client, data);

    await client.query('COMMIT');
    res.status(200).send({
      success: true,
      data: block
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const updateBlock = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const data = {
      id: req.params.id,
      moduleId: req.body.moduleId,
      title: req.body.title,
      name: req.body.name,
      position: req.body.position,
    };
    const { block } = await blockService.updateBlock(client, data);

    await client.query('COMMIT');
    res.status(200).send({
      success: true,
      data: block
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const deleteBlocks = async (req, res) => {
  const client = await pool.connect();
  try {
    handlers.validateRequest(req, 'ids');
    await client.query('BEGIN');

    const ids = req.body.ids;
    await blockService.deleteBlocks(client, ids);

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

const getBlocksUser = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userId = req.user.id;
    const search = req.body.search;
    const moduleId = req.body.moduleId;
    const { blocks } = moduleId ?
      await blockService.getBlocksUserByModuleId(client, moduleId, userId, search) :
      await blockService.getBlocksUser(client, userId, search);

    await client.query('COMMIT');
    res.status(200).send({
      success: true,
      data: blocks
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const getBlockUser = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const id = req.params.id;
    const userId = req.user.id;
    const { block } = await blockService.getBlockUser(client, id, userId);

    await client.query('COMMIT');
    res.status(200).send({
      success: true,
      data: block
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}

module.exports = {
  getBlocks,
  getBlock,
  createBlock,
  updateBlock,
  deleteBlocks,

  getBlocksUser,
  getBlockUser
}