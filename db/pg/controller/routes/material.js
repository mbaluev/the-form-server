const uuid = require("uuid");
const pool = require("../../utils/pool");
const handlers = require("../../utils/handlers");
const materialService = require("../service/material");

const getMaterials = async (req, res) => {
  const client = await pool.connect();
  try {
    handlers.validateRequest(req, 'blockId');
    await client.query('BEGIN')

    const blockId = req.body.blockId;
    const { materials } = await materialService.getMaterialsByBlockId(client, blockId);

    await client.query('COMMIT')
    res.status(200).send({
      success: true,
      data: materials
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const getMaterial = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN')

    const id = req.params.id;
    const { material } = await materialService.getMaterial(client, id);

    await client.query('COMMIT')
    res.status(200).send({
      success: true,
      data: material
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const createMaterial = async (req, res) => {
  const client = await pool.connect();
  try {
    handlers.validateRequest(req, 'blockId', 'document', 'document.name', 'document.description', 'document.file.id');
    await client.query('BEGIN')

    const dataFile = req.body.document.file;
    const dataDocument = {
      id: uuid.v4(),
      fileId: dataFile.id,
      name: req.body.document.name,
      description: req.body.document.description
    };
    const dataMaterial = {
      id: uuid.v4(),
      blockId: req.body.blockId,
      documentId: dataDocument.id
    };
    const { material } = await materialService.createMaterial(client, dataMaterial, dataDocument, dataFile);

    await client.query('COMMIT')
    res.status(200).send({
      success: true,
      data: material
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const updateMaterial = async (req, res) => {
  const client = await pool.connect();
  try {
    handlers.validateRequest(req, 'blockId', 'document', 'document.name', 'document.description', 'document.file.id');
    await client.query('BEGIN')

    const dataFile = req.body.document.file;
    const dataDocument = {
      id: req.body.document.id,
      fileId: dataFile.id,
      name: req.body.document.name,
      description: req.body.document.description
    };
    const dataMaterial = {
      id: req.params.id,
      blockId: req.body.blockId,
      documentId: dataDocument.id
    };
    const { material } = await materialService.updateMaterial(client, dataMaterial, dataDocument, dataFile);

    res.status(200).send({
      success: true,
      data: material
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const deleteMaterials = async (req, res) => {
  const client = await pool.connect();
  try {
    handlers.validateRequest(req, 'ids');
    await client.query('BEGIN');

    const ids = req.body.ids;
    await materialService.deleteMaterials(client, ids);

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

const getMaterialsUser = async (req, res) => {
  const client = await pool.connect();
  try {
    handlers.validateRequest(req, 'blockId');
    await client.query('BEGIN')

    const blockId = req.body.blockId;
    const userId = req.user.id;
    const { materials } = await materialService.getMaterialsByBlockIdUser(client, blockId, userId);

    await client.query('COMMIT')
    res.status(200).send({
      success: true,
      data: materials
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const getMaterialUser = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN')

    const id = req.params.id;
    const userId = req.user.id;
    const { material } = await materialService.getMaterialUser(client, id, userId);
    await materialService.updateMaterialUser(client, id, userId);

    await client.query('COMMIT')
    res.status(200).send({
      success: true,
      data: material
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const updateMaterialUser = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN')

    const id = req.params.id;
    const userId = req.user.id;
    await materialService.updateMaterialUser(client, id, userId);
    // await blockService.updateBlockUser(client, id, userId);
    // await moduleService.updateModuleUser(client, id, userId);

    await client.query('COMMIT')
    res.status(200).send({
      success: true
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}

module.exports = {
  getMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterials,

  getMaterialsUser,
  getMaterialUser,
  updateMaterialUser
}
