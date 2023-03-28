const questionEntity = require("../entity/question");
const questionAnswerEntity = require("../entity/questionAnswer");
const questionAnswerCorrectEntity = require("../entity/questionAnswerCorrect");
const uuid = require("uuid");

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
    const options = await questionAnswerEntity.list(client, { questionId: question.id });
    const optionsCorrectId = await questionAnswerCorrectEntity.list(client, { questionId: question.id });
    question.options = options.map(option => {
      return {
        id: option.id,
        title: option.title
      }
    });
    question.optionsCorrectId = optionsCorrectId.map(option => option.questionAnswerId);
    return { question };
  } catch (err) {
    throw err;
  }
}
const createQuestion = async (client, dataQuestion, dataOptions, dataOptionsCorrectId) => {
  try {
    const question = await questionEntity.create(client, dataQuestion);
    for (const dataOption of dataOptions) {
      const option = {...dataOption, questionId: question.id }
      await questionAnswerEntity.create(client, option);
    }
    for (const dataOptionCorrectId of dataOptionsCorrectId) {
      const optionCorrect = {
        id: uuid.v4(),
        questionId: question.id,
        questionAnswerId: dataOptionCorrectId
      }
      await questionAnswerCorrectEntity.create(client, optionCorrect);
    }
    question.options = dataOptions.map(({id, ...option }) => option);
    question.optionsCorrectId = dataOptionsCorrectId;
    return { question };
  } catch (err) {
    throw err;
  }
}
const updateQuestion = async (client, question, options, optionsCorrectId) => {
  try {
    await questionEntity.update(client, question);

    // options create update
    const optionsExist = await questionAnswerEntity.list(client, { questionId: question.id });
    const optionsCreate = options.filter(option => !optionsExist.find(optionExist => option.id === optionExist.id));
    const optionsUpdate = options.filter(option => optionsExist.find(optionExist => option.id === optionExist.id));
    const promisesOptionsCreate = optionsCreate.map((option) => {
      const dataOption = { ...option, questionId: question.id };
      return questionAnswerEntity.create(client, dataOption);
    })
    await Promise.all(promisesOptionsCreate);
    const promisesOptionsUpdate = optionsUpdate.map((option) => {
      return questionAnswerEntity.update(client, option );
    })
    await Promise.all(promisesOptionsUpdate);

    // optionsCorrectId create delete
    const optionsCorrectIdExist = await questionAnswerCorrectEntity.list(client, { questionId: question.id });
    const optionsCorrectIdCreate = optionsCorrectId.filter(d => !optionsCorrectIdExist.find(dExist => d === dExist.questionAnswerId));
    const optionsCorrectIdDelete = optionsCorrectIdExist.filter(dExist => !optionsCorrectId.find(d => d === dExist.questionAnswerId));
    const promisesOptionsCorrectIdCreate = optionsCorrectIdCreate.map((optionCorrectId) => {
      const dataOptionCorrect = {
        id: uuid.v4(),
        questionId: question.id,
        questionAnswerId: optionCorrectId
      }
      return questionAnswerCorrectEntity.create(client, dataOptionCorrect);
    })
    await Promise.all(promisesOptionsCorrectIdCreate);
    const promisesOptionsCorrectIdDelete = optionsCorrectIdDelete.map((option) => {
      return questionAnswerCorrectEntity.del(client, option.id );
    })
    await Promise.all(promisesOptionsCorrectIdDelete);

    // options delete
    const optionsDelete = optionsExist.filter(optionExist => !options.find(option => option.id === optionExist.id));
    const promisesOptionsDelete = optionsDelete.map((option) => {
      return questionAnswerEntity.del(client, option.id );
    })
    await Promise.all(promisesOptionsDelete);

    question.options = options.map(({id, ...option }) => option);
    question.optionsCorrectId = optionsCorrectId;

    return { question };
  } catch (err) {
    throw err;
  }
}
const deleteQuestion = async (client, id) => {
  try {
    // get info
    const options = await questionAnswerEntity.list(client, { questionId: id });
    const optionsCorrect = await questionAnswerCorrectEntity.list(client, { questionId: id });

    // delete
    for (const optionCorrect of optionsCorrect) {
      await questionAnswerCorrectEntity.del(client, optionCorrect.id)
    }
    for (const option of options) {
      await questionAnswerEntity.del(client, option.id)
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

module.exports = {
  getQuestionsByBlockId,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  deleteQuestions
}