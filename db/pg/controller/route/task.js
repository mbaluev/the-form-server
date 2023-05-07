const uuid = require("uuid");
const pool = require("../../utils/pool");
const handlers = require("../../utils/handlers");
const taskService = require("../service/task");

const getTasks = async (req, res) => {
  const client = await pool.connect();
  try {
    handlers.validateRequest(req, 'blockId');
    await client.query('BEGIN')

    const blockId = req.body.blockId;
    const { tasks } = await taskService.getTasksByBlockId(client, blockId);

    await client.query('COMMIT')
    res.status(200).send({
      success: true,
      data: tasks
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const getTask = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN')

    const id = req.params.id;
    const { task } = await taskService.getTask(client, id);

    await client.query('COMMIT')
    res.status(200).send({
      success: true,
      data: task
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const createTask = async (req, res) => {
  const client = await pool.connect();
  try {
    handlers.validateRequest(req, 'blockId', 'document', 'document.name', 'document.description', 'document.file.id', 'taskAnswers');
    await client.query('BEGIN')

    const dataFile = req.body.document.file;
    const dataDocument = {
      id: uuid.v4(),
      fileId: dataFile.id,
      name: req.body.document.name,
      description: req.body.document.description
    };
    const dataTaskAnswers = req.body.taskAnswers;
    const dataTask = {
      id: uuid.v4(),
      blockId: req.body.blockId,
      documentId: dataDocument.id
    };
    const { task } = await taskService.createTask(client, dataTask, dataDocument, dataFile, dataTaskAnswers);

    await client.query('COMMIT')
    res.status(200).send({
      success: true,
      data: task
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const updateTask = async (req, res) => {
  const client = await pool.connect();
  try {
    handlers.validateRequest(req, 'blockId', 'document', 'document.name', 'document.description', 'document.file.id', 'taskAnswers');
    await client.query('BEGIN')

    const dataFile = req.body.document.file;
    const dataDocument = {
      id: req.body.document.id,
      fileId: dataFile.id,
      name: req.body.document.name,
      description: req.body.document.description
    };
    const dataTaskAnswers = req.body.taskAnswers;
    const dataTask = {
      id: req.params.id,
      blockId: req.body.blockId,
      documentId: dataDocument.id,
    };
    const { task } = await taskService.updateTask(client, dataTask, dataDocument, dataFile, dataTaskAnswers);

    await client.query('COMMIT')
    res.status(200).send({
      success: true,
      data: task
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const deleteTasks = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN')

    const ids = req.body.ids;
    await taskService.deleteTasks(client, ids);

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

const getTasksUser = async (req, res) => {
  const client = await pool.connect();
  try {
    handlers.validateRequest(req, 'blockId');
    await client.query('BEGIN');

    const blockId = req.body.blockId;
    const userId = req.user.id;
    const { tasks } = await taskService.getTasksUserByBlockId(client, userId, blockId);

    await client.query('COMMIT')
    res.status(200).send({
      success: true,
      data: tasks
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const getTaskUser = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN')

    const id = req.params.id;
    const userId = req.user.id;
    const { task } = await taskService.getTaskUser(client, id, userId);

    await client.query('COMMIT')
    res.status(200).send({
      success: true,
      data: task
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTasks,

  getTasksUser,
  getTaskUser
}