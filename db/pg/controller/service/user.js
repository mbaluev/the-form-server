const userEntity = require("../table/user");
const userModuleEntity = require("../table/userModule");

const getUsers = async (client, search) => {
  try {
    const data = { search }
    const users = await userEntity.list(client, data);
    return { users };
  } catch (err) {
    throw err;
  }
}
const getUser = async (client, id) => {
  try {
    const data = { id };
    const user = await userEntity.get(client, data);
    return { user };
  } catch (err) {
    throw err;
  }
}
const createUser = async (client, dataUser) => {
  try {
    const user = await userEntity.create(client, dataUser);
    return { user };
  } catch (err) {
    throw err;
  }
}
const updateUser = async (client, dataUser) => {
  try {
    const user = await userEntity.update(client, dataUser);
    return { user };
  } catch (err) {
    throw err;
  }
}
const deleteUser = async (client, id) => {
  try {
    await userModuleEntity.delByUserId(client, id);
    await userEntity.del(client, id);
  } catch (err) {
    throw err;
  }
}
const deleteUsers = async (client, ids) => {
  try {
    for (const id of ids) {
      await deleteUser(client, id);
    }
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  deleteUsers
}