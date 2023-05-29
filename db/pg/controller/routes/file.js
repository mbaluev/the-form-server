const pool = require("../../utils/pool");
const handlers = require("../../utils/handlers");
const fileService = require("../service/file");

const upload = async (req, res) => {
  const client = await pool.connect();
  try {
    const file = req.file;
    if (!file) handlers.throwError(400, 'No File is selected.');
    await client.query('BEGIN');

    const dataFile = {
      id: file.filename,
      name: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path
    }
    await fileService.uploadFile(client, dataFile);

    await client.query('COMMIT');
    res.status(200).send({
      success: true,
      data: dataFile
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const download = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN')

    const id = req.params.id;
    const { file } = await fileService.downloadFile(client, id);

    await client.query('COMMIT')
    res.download(file.path, file.name);
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}

module.exports = {
  upload,
  download
}