const uuid = require("uuid");
const questionEntity = require("../table/question");
const questionOptionEntity = require("../table/questionOption");
const userBlockEntity = require("../table/userBlock");
const userQuestionEntity = require("../table/userQuestion");
const userQuestionAnswerEntity = require("../table/userQuestionAnswer");

const getQuestionsByBlockId = async (client, blockId) => {
  try {
    const data = { blockId };
    const questionsList = await questionEntity.list(client, data);
    const questions = [];
    for (const questionItem of questionsList) {
      const { question } = await getQuestion(client, questionItem.id);
      questions.push(question);
    }
    return { questions };
  } catch (err) {
    throw err;
  }
}
const getQuestion = async (client, id) => {
  try {
    const data = { id };
    const question = await questionEntity.get(client, data);
    const dataOptions = { questionId: question.id };
    question.options = await questionOptionEntity.list(client, dataOptions);
    return { question };
  } catch (err) {
    throw err;
  }
}
const createQuestion = async (client, dataQuestion, dataOptions) => {
  try {
    const question = await questionEntity.create(client, dataQuestion);
    question.options = [];
    for (const dataOption of dataOptions) {
      dataOption.questionId = question.id;
      const option = await questionOptionEntity.create(client, dataOption);
      question.options.push(option);
    }
    return { question };
  } catch (err) {
    throw err;
  }
}
const updateQuestion = async (client, question, options) => {
  try {
    await questionEntity.update(client, question);

    // options create update
    const optionsExist = await questionOptionEntity.list(client, { questionId: question.id });
    const optionsCreate = options.filter(option => !optionsExist.find(optionExist => option.id === optionExist.id));
    const optionsUpdate = options.filter(option => optionsExist.find(optionExist => option.id === optionExist.id));
    const promisesOptionsCreate = optionsCreate.map((option) => {
      const dataOption = { ...option, questionId: question.id };
      return questionOptionEntity.create(client, dataOption);
    })
    await Promise.all(promisesOptionsCreate);
    const promisesOptionsUpdate = optionsUpdate.map((option) => {
      return questionOptionEntity.update(client, option );
    })
    await Promise.all(promisesOptionsUpdate);

    // options delete
    const optionsDelete = optionsExist.filter(optionExist => !options.find(option => option.id === optionExist.id));
    const promisesOptionsDelete = optionsDelete.map((option) => {
      return questionOptionEntity.del(client, option.id );
    })
    await Promise.all(promisesOptionsDelete);

    question.options = options;
    return { question };
  } catch (err) {
    throw err;
  }
}
const deleteQuestion = async (client, id) => {
  try {
    // get options
    const options = await questionOptionEntity.list(client, { questionId: id });

    // delete
    for (const option of options) {
      await questionOptionEntity.del(client, option.id)
    }
    await questionEntity.del(client, id)
  } catch (err) {
    throw err;
  }
}
const deleteQuestions = async (client, ids) => {
  try {
    for (const id of ids) {
      await deleteQuestion(client, id);
    }
  } catch (err) {
    throw err;
  }
}

const getQuestionsByBlockIdUser = async (client, blockId, userId) => {
  try {
    const data = { blockId, userId };
    const questionsList = await questionEntity.listUser(client, data);
    const questions = [];
    for (const questionItem of questionsList) {
      const dataOptions = { questionId: questionItem.id, userId }
      questionItem.options = await questionOptionEntity.listUser(client, dataOptions);
      const answers = await userQuestionAnswerEntity.list(client, dataOptions);
      questionItem.answers = answers.map(d => d.optionId);
      questions.push(questionItem);
    }
    return { questions };
  } catch (err) {
    throw err;
  }
}
const checkAnswersByBlockIdUser = async (client, blockId, questions, userId) => {
  try {
    // check answers
    const { questions: questionsList } = await getQuestionsByBlockId(client, blockId);
    const completes = [];
    for (const questionUser of questions) {
      const questionId = questionUser.id;
      const answers = questionUser.answers;

      // update userQuestions
      const question = questionsList.find(d => d.id === questionId);
      const optionsCorrect = question.options.filter(o => o.correct).map(o => o.id);
      const complete = JSON.stringify(optionsCorrect) === JSON.stringify(answers);
      completes.push(complete);
      const userQuestion = await userQuestionEntity.get(client, { questionId });
      if (userQuestion) {
        const dataUserQuestion = { ...userQuestion, complete };
        await userQuestionEntity.update(client, dataUserQuestion);
      } else {
        const dataUserQuestion = {
          id: uuid.v4(),
          questionId,
          userId,
          complete
        };
        await userQuestionEntity.create(client, dataUserQuestion);
      }

      // save userQuestionAnswers
      await userQuestionAnswerEntity.delByQuestionIdUserId(client, questionId, userId);
      for (const answer of answers) {
        const dataUserQuestionAnswer = {
          id: uuid.v4(),
          questionId,
          optionId: answer,
          userId,
        }
        await userQuestionAnswerEntity.create(client, dataUserQuestionAnswer);
      }
    }

    // update userBlocks.completeQuestions
    if (completes.filter(complete => !complete).length === 0) {
      const userBlock = await userBlockEntity.get(client, { blockId });
      const dataUserBlock = { ...userBlock, completeQuestions: true }
      await userBlockEntity.update(client, dataUserBlock);
    }
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getQuestionsByBlockId,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  deleteQuestions,

  getQuestionsByBlockIdUser,
  checkAnswersByBlockIdUser
}