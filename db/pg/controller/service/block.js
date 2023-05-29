const blockEntity = require("../table/block");
const userBlockEntity = require("../table/userBlock");
const materialService = require(".//material");
const questionService = require(".//question");
const taskService = require(".//task");
const uuid = require("uuid");

const getBlocks = async (client, search) => {
  try {
    const data = { search };
    const blocks = await blockEntity.list(client, data);
    return { blocks };
  } catch (err) {
    throw err;
  }
}
const getBlocksByModuleId = async (client, moduleId, search) => {
  try {
    const data = { moduleId, search };
    const blocks = await blockEntity.list(client, data);
    return { blocks };
  } catch (err) {
    throw err;
  }
}
const getBlock = async (client, id) => {
  try {
    const data = { id };
    const block = await blockEntity.get(client, data);
    return { block };
  } catch (err) {
    throw err;
  }
}
const createBlock = async (client, dataBlock) => {
  try {
    const block = await blockEntity.create(client, dataBlock);
    return { block };
  } catch (err) {
    throw err;
  }
}
const updateBlock = async (client, dataBlock) => {
  try {
    const block = await blockEntity.update(client, dataBlock);
    return { block };
  } catch (err) {
    throw err;
  }
}
const deleteBlock = async (client, id) => {
  try {
    // delete materials
    const { materials } = await materialService.getMaterialsByBlockId(client, id);
    const materialIds = materials.map(d => d.id);
    await materialService.deleteMaterials(client, materialIds);

    // delete questions
    const { questions } = await questionService.getQuestionsByBlockId(client, id);
    const questionIds = questions.map(d => d.id);
    await questionService.deleteQuestions(client, questionIds);

    // delete tasks
    const { tasks } = await taskService.getTasksByBlockId(client, id);
    const taskIds = tasks.map(d => d.id);
    await taskService.deleteTasks(client, taskIds);

    // delete block
    await blockEntity.del(client, id);
  } catch (err) {
    throw err;
  }
}
const deleteBlocks = async (client, ids) => {
  try {
    for (const id of ids) {
      await deleteBlock(client, id);
    }
  } catch (err) {
    throw err;
  }
}

const getBlocksUser = async (client, userId, search) => {
  try {
    const data = { userId, search };
    const blocks = await blockEntity.listUser(client, data);
    return { blocks };
  } catch (err) {
    throw err;
  }
}
const getBlocksUserByModuleId = async (client, moduleId, userId, search) => {
  try {
    const data = { moduleId, userId, search };
    const blocks = await blockEntity.listUser(client, data);
    return { blocks };
  } catch (err) {
    throw err;
  }
}
const getBlockUser = async (client, id, userId) => {
  try {
    const data = { id, userId };
    const block = await blockEntity.getUser(client, data);
    return { block };
  } catch (err) {
    throw err;
  }
}

const initBlocksUser = async (client, userId) => {
  try {
    const blocks = await blockEntity.list(client, {});
    const blocksUser = await blockEntity.listUser(client, { userId });
    for (const block of blocks) {
      const blockUser = blocksUser.find(d => d.id === block.id);
      if (!blockUser) {
        const dataBlockUser = {
          id: uuid.v4(),
          blockId: block.id,
          userId,
          enable: false,
          complete: false,
          completeMaterials: false,
          completeQuestions: false,
          completeTasks: false
        };
        await userBlockEntity.create(client, dataBlockUser);
      }
    }
  } catch (err) {
    throw err;
  }
}
const checkFirstBlockEnabled = async (client, userId) => {
  try {
    const data = { userId, enable: true };
    const blocks = await blockEntity.listUser(client, data);
    if (blocks.length === 0) {
      const data = { position: 1 };
      const block = await blockEntity.get(client, data);
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
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getBlocks,
  getBlocksByModuleId,
  getBlock,
  createBlock,
  updateBlock,
  deleteBlock,
  deleteBlocks,

  getBlocksUser,
  getBlocksUserByModuleId,
  getBlockUser,

  initBlocksUser,
  checkFirstBlockEnabled,
}