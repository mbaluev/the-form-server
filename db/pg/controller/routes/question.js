const uuid = require("uuid");
const pool = require("../../utils/pool");
const handlers = require("../../utils/handlers");
const questionService = require("../service/question");

const getQuestions = async (req, res) => {
  const client = await pool.connect();
  try {
    handlers.validateRequest(req, 'blockId');
    await client.query('BEGIN');

    const blockId = req.body.blockId;
    const { questions } = await questionService.getQuestionsByBlockId(client, blockId);

    await client.query('COMMIT');
    res.status(200).send({
      success: true,
      data: questions
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const getQuestion = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const id = req.params.id;
    const { question } = await questionService.getQuestion(client, id);

    await client.query('COMMIT');
    res.status(200).send({
      success: true,
      data: question
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const createQuestion = async (req, res) => {
  const client = await pool.connect();
  try {
    handlers.validateRequest(req, 'blockId', 'title', 'options');
    await client.query('BEGIN');

    const dataQuestion = {
      id: uuid.v4(),
      blockId: req.body.blockId,
      title: req.body.title,
      position: req.body.position
    };
    const dataOptions = req.body.options;
    const { question } = await questionService.createQuestion(client, dataQuestion, dataOptions);

    await client.query('COMMIT');
    res.status(200).send({
      success: true,
      data: question
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const updateQuestion = async (req, res) => {
  const client = await pool.connect();
  try {
    handlers.validateRequest(req, 'blockId', 'title', 'options');
    await client.query('BEGIN')

    const dataOptions = req.body.options;
    const dataQuestion = {
      id: req.params.id,
      blockId: req.body.blockId,
      title: req.body.title,
      position: req.body.position
    };
    const { question } = await questionService.updateQuestion(client, dataQuestion, dataOptions);

    await client.query('COMMIT');
    res.status(200).send({
      success: true,
      data: question
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const deleteQuestions = async (req, res) => {
  const client = await pool.connect();
  try {
    handlers.validateRequest(req, 'ids');
    await client.query('BEGIN');

    const ids = req.body.ids;
    await questionService.deleteQuestions(client, ids);

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

const getQuestionsUser = async (req, res) => {
  const client = await pool.connect();
  try {
    handlers.validateRequest(req, 'blockId');
    await client.query('BEGIN');

    const blockId = req.body.blockId;
    const userId = req.user.id;
    const { questions } = await questionService.getQuestionsByBlockIdUser(client, blockId, userId);

    await client.query('COMMIT');
    res.status(200).send({
      success: true,
      data: questions
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}
const checkQuestionsUser = async (req, res) => {
  const client = await pool.connect();
  try {
    handlers.validateRequest(req, 'blockId');
    handlers.validateRequest(req, 'questions');
    await client.query('BEGIN');

    const blockId = req.body.blockId;
    const questions = req.body.questions;
    const userId = req.user.id;
    await questionService.checkAnswersByBlockIdUser(client, blockId, questions, userId);
    const { questions: questionsUpdated } = await questionService.getQuestionsByBlockIdUser(client, blockId, userId);
    // await blockService.updateBlockUser(client, id, userId);
    // await moduleService.updateModuleUser(client, id, userId);

    await client.query('COMMIT');
    res.status(200).send({
      success: true,
      data: questionsUpdated
    });
  } catch (err) {
    await handlers.errorHandler(client, res, err);
  } finally {
    handlers.finallyHandler(client);
  }
}

module.exports = {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestions,

  getQuestionsUser,
  checkQuestionsUser
}