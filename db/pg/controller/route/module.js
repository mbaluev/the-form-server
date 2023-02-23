const uuid = require("uuid");
const pool = require("../../utils/pool");
const handlers = require("../../utils/handlers");
const moduleService = require("../service/module");
const blockService = require("../service/block");
const userModuleEntity = require("../entity/userModule");
const userBlockEntity = require("../entity/userBlock");

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
      await moduleService.getModuleByBlockId(client, blockId):
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
    const userId = req.user.id;
    const { module } = await moduleService.getModuleUser(client, id, userId)

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

const userMiddleware = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN')

    const userId = req.user.id;

    // check first module & block enabled
    const { modules } = await moduleService.getModulesUserEnable(client, userId)
    const { blocks } = await blockService.getBlocksUserEnable(client, userId)
    if (modules.length === 0) {
      const { module } = await moduleService.getModuleFirst(client);
      const dataUserModule = {
        id: uuid.v4(),
        moduleId: module.id,
        userId,
        enable: true,
        complete: false
      };
      await userModuleEntity.create(client, dataUserModule);
      if (blocks.length === 0) {
        const { block } = await blockService.getBlockFirstByModuleId(client, module.id);
        const dataUserBlock = {
          id: uuid.v4(),
          blockId: block.id,
          userId,
          enable: true,
          complete: false,
          completeMaterials: false,
          completeQuestions: false,
          completeTasks: false
        };
        await userBlockEntity.create(client, dataUserBlock);
      }
    }

    await client.query('COMMIT')
    next()
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

  userMiddleware,
}