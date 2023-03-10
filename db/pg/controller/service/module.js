const moduleEntity = require("../entity/module");
const blockService = require("../service/block");

const getModules = async (client, search) => {
  try {
    const data = { search };
    const modules = await moduleEntity.list(client, data);
    return { modules };
  } catch (err) {
    throw err;
  }
}
const getModule = async (client, id) => {
  try {
    const data = { id };
    const module = await moduleEntity.get(client, data);
    return { module };
  } catch (err) {
    throw err;
  }
}
const getModuleByBlockId = async (client, blockId) => {
  try {
    const data = { blockId };
    const module = await moduleEntity.get(client, data);
    return { module };
  } catch (err) {
    throw err;
  }
}
const getModuleFirst = async (client) => {
  try {
    const data = { position: 1 };
    const module = await moduleEntity.get(client, data);
    return { module };
  } catch (err) {
    throw err;
  }
}
const createModule = async (client, dataModule) => {
  try {
    const module = await moduleEntity.create(client, dataModule);
    return { module };
  } catch (err) {
    throw err;
  }
}
const updateModule = async (client, dataModule) => {
  try {
    const module = await moduleEntity.update(client, dataModule);
    return { module };
  } catch (err) {
    throw err;
  }
}
const deleteModule = async (client, id) => {
  try {
    // delete blocks
    const { blocks } = await blockService.getBlocksByModuleId(client, id);
    const blockIds = blocks.map(d => d.id);
    await blockService.deleteBlocks(client, blockIds);

    // delete module
    await moduleEntity.del(client, id);
  } catch (err) {
    throw err;
  }
}
const deleteModules = async (client, ids) => {
  try {
    for (const id of ids) {
      await deleteModule(client, id);
    }
  } catch (err) {
    throw err;
  }
}

const getModulesUser = async (client, userId, search) => {
  try {
    const data = { userId, search };
    const modulesList = await moduleEntity.listUser(client, data);
    const modules = [];
    for (const moduleItem of modulesList) {
      const { blocks } = await blockService.getBlocksUserByModuleId(client, moduleItem.id, userId);
      moduleItem.blocks = blocks;
      modules.push(moduleItem);
    }
    return { modules };
  } catch (err) {
    throw err;
  }
}
const getModulesUserEnable = async (client, userId, search) => {
  try {
    const data = { userId, enable: true, search };
    const modules = await moduleEntity.listUser(client, data);
    return { modules };
  } catch (err) {
    throw err;
  }
}
const getModuleUser = async (client, id, userId) => {
  try {
    const data = { id, userId };
    const module = await moduleEntity.getUser(client, data);
    const { blocks } = await blockService.getBlocksUserByModuleId(client, module.id, userId);
    module.blocks = blocks;
    return { module };
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getModules,
  getModule,
  getModuleByBlockId,
  getModuleFirst,
  createModule,
  updateModule,
  deleteModule,
  deleteModules,

  getModulesUser,
  getModulesUserEnable,
  getModuleUser,
}