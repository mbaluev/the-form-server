const fileEntity = require("../table/file");

const uploadFile = async (client, data) => {
  try {
    const file = await fileEntity.create(client, data);
    return { file };
  } catch (err) {
    throw err;
  }
}
const downloadFile = async (client, id) => {
  try {
    const data = { id };
    const file = await fileEntity.get(client, data);
    return { file };
  } catch (err) {
    throw err;
  }
}

module.exports = {
  uploadFile,
  downloadFile,
}