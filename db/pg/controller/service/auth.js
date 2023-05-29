const uuid = require("uuid");
const userEntity = require("../table/user");
const moduleEntity = require("../table/module");
const userModuleEntity = require("../table/userModule");
const { getToken, getRefreshToken } = require("../../passport/auth")
const handlers = require("../../utils/handlers");
const jwt = require("jsonwebtoken");

const signIn = async (client, id) => {
  try {
    const user = await userEntity.get(client, { id });
    const dataToken = {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      active: user.active,
      paid: user.paid,
      admin: user.admin
    }
    const token = getToken(dataToken);
    const dataRefreshToken = {
      id: user.id
    }
    const refreshToken = getRefreshToken(dataRefreshToken)
    const dataUserUpdate = {
      id: user.id,
      refreshToken
    }
    await userEntity.update(client, dataUserUpdate);
    return {
      token,
      refreshToken
    }
  } catch (err) {
    throw err;
  }
}
const signUp = async (client, dataUser) => {
  try {
    await userEntity.create(client, dataUser);
    const module = await moduleEntity.get(client, { position: 1 });
    const dataUserModule = {
      id: uuid.v4(),
      moduleId: module.id,
      userId: dataUser.id,
      enable: true,
      complete: false
    };
    await userModuleEntity.create(client, dataUserModule);
  } catch (err) {
    throw err;
  }
}
const signOut = async (client, id) => {
  try {
    const user = userEntity.get(client, { id })
    if (!user) handlers.throwError(401, 'Unauthorized');
    const dataUserUpdate = {
      id: user.id,
      refreshToken: null
    }
    await userEntity.update(client, dataUserUpdate);
  } catch (err) {
    throw err;
  }
}
const token = async (client, refreshToken) => {
  try {
    if (!refreshToken) {
      return {
        code: 401,
        success: false,
        message: 'Unauthorized'
      }
    }
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const id = payload.id;
    const user = await userEntity.get(client, { id });
    if (!user) handlers.throwError(401, 'Unauthorized');
    if (refreshToken !== user.refreshToken) handlers.throwError(401, 'Unauthorized');
    const dataToken = {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      active: user.active,
      paid: user.paid,
      admin: user.admin
    }
    const newToken = getToken(dataToken);
    return {
      id,
      newToken
    }
  } catch (err) {
    throw err;
  }
}
const refreshToken = async (client, refreshToken) => {
  try {
    const { id, newToken } = await token(client, refreshToken);
    const dataRefreshToken = { id }
    const newRefreshToken = getRefreshToken(dataRefreshToken)
    const dataUserUpdate = { id, refreshToken: newRefreshToken }
    await userEntity.update(client, dataUserUpdate);
    return {
      id,
      newToken,
      newRefreshToken
    }
  } catch (err) {
    throw err;
  }
}

module.exports = {
  signIn,
  signUp,
  signOut,
  refreshToken,
  token
}