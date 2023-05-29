const moduleEntity = require("../table/module");
const userModuleEntity = require("../table/userModule");
const blockService = require(".//block");
const uuid = require("uuid");

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
const getModuleUserByBlockId = async (client, blockId, userId) => {
  try {
    const data = { blockId, userId };
    const module = await moduleEntity.getUser(client, data);
    const { blocks } = await blockService.getBlocksUserByModuleId(client, module.id, userId);
    module.blocks = blocks;
    return { module };
  } catch (err) {
    throw err;
  }
}

const initModulesUser = async (client, userId) => {
  try {
    const modules = await moduleEntity.list(client, {});
    const modulesUser = await moduleEntity.listUser(client, { userId });
    for (const module of modules) {
      const moduleUser = modulesUser.find(d => d.id === module.id);
      if (!moduleUser) {
        const dataModuleUser = {
          id: uuid.v4(),
          moduleId: module.id,
          userId,
          enable: false,
          complete: false
        };
        await userModuleEntity.create(client, dataModuleUser);
      }
    }
  } catch (err) {
    throw err;
  }
}
const checkFirstModuleEnabled = async (client, userId) => {
  try {
    const data = { userId, enable: true };
    const modules = await moduleEntity.listUser(client, data);
    if (modules.length === 0) {
      const data = { position: 1 };
      const module = await moduleEntity.get(client, data);
      const dataUserModule = {
        id: uuid.v4(),
        moduleId: module.id,
        userId,
        enable: true,
        complete: false
      };
      await userModuleEntity.create(client, dataUserModule);
    }
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getModules,
  getModule,
  getModuleByBlockId,
  createModule,
  updateModule,
  deleteModule,
  deleteModules,

  getModulesUser,
  getModuleUser,
  getModuleUserByBlockId,

  initModulesUser,
  checkFirstModuleEnabled,
}