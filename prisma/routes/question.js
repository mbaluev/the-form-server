const handlers = require("../utils/handlers");
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const list = async (req, res) => {
  try {
    handlers.validateRequest(req, 'blockId');
    const blockId = req.body.blockId;
    const questions = await prisma.question.findMany({
      where: { blockId },
      include: {
        questionOptions: true
      },
      orderBy: {
        position: 'asc'
      }
    })
    res.status(200).send({
      success: true,
      data: questions
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const item = async (req, res) => {
  try {
    const id = req.params.id;
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        questionOptions: true
      }
    });
    res.status(200).send({
      success: true,
      data: question
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const create = async (req, res) => {
  try {
    handlers.validateRequest(req, 'blockId', 'title', 'position', 'questionOptions');
    const question = await prisma.question.create({
      data: {
        blockId: req.body.blockId,
        title: req.body.title,
        position: Number(req.body.position),
        questionOptions: {
          create: req.body.questionOptions.map(d => ({
            title: d.title,
            correct: d.correct
          }))
        }
      },
      include: {
        questionOptions: true
      }
    })
    res.status(200).send({
      success: true,
      data: question
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const update = async (req, res) => {
  try {
    handlers.validateRequest(req, 'blockId', 'title', 'position', 'questionOptions');
    const id = req.params.id
    const questionOptions = req.body.questionOptions;
    await prisma.question.update({
      where: { id },
      data: {
        blockId: req.body.blockId,
        title: req.body.title,
        position: req.body.position,
      }
    })

    // options create update
    const optionsExist = await prisma.questionOption.findMany({
      where: { questionId: id }
    });
    const optionsCreate = questionOptions.filter(option => !optionsExist.find(optionExist => option.id === optionExist.id));
    const optionsUpdate = questionOptions.filter(option => optionsExist.find(optionExist => option.id === optionExist.id));
    await prisma.questionOption.createMany({
      data: optionsCreate.map(d => ({
        questionId: id,
        title: d.title,
        correct: d.correct
      }))
    })
    for (const optionUpdate of optionsUpdate) {
      await prisma.questionOption.update({
        where: { id: optionUpdate.id },
        data: {
          questionId: id,
          title: optionUpdate.title,
          correct: optionUpdate.correct
        }
      })
    }

    // options delete
    const optionsDelete = optionsExist.filter(optionExist => !questionOptions.find(option => option.id === optionExist.id));
    for (const optionDelete of optionsDelete) {
      await prisma.questionOption.delete({
        where: { id: optionDelete.id }
      })
    }

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        questionOptions: true
      }
    });
    res.status(200).send({
      success: true,
      data: question
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const del = async (req, res) => {
  try {
    handlers.validateRequest(req, 'ids');
    const ids = req.body.ids;
    for (const id of ids) {
      await prisma.questionOption.deleteMany({
        where: { questionId: id }
      })
      await prisma.question.delete({
        where: { id }
      })
    }
    res.status(200).send({
      success: true,
      changes: ids.length
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}

const userList = async (req, res) => {
  try {
    handlers.validateRequest(req, 'blockId');
    const blockId = req.body.blockId;
    const questions = (await prisma.question.findMany({
      where: { blockId },
      include: {
        questionOptions: {
          select: {
            id: true,
            title: true,
          },
        },
        userQuestions: {
          select: {
            complete: true,
            sent: true
          }
        },
        userQuestionAnswers: {
          select: {
            questionOptionId: true
          }
        }
      },
      orderBy: {
        position: 'asc'
      }
    })).map(item => {
      const { userQuestions, userQuestionAnswers, ...userQuestion } = item;
      userQuestion.complete = userQuestions?.[0]?.complete;
      userQuestion.sent = userQuestions?.[0]?.sent;
      userQuestion.questionAnswers = userQuestionAnswers.map(d => d.questionOptionId);
      return userQuestion;
    })
    res.status(200).send({
      success: true,
      data: questions
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const userItem = async (req, res) => {
  try {
    const id = req.params.id;
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        questionOptions: {
          select: {
            id: true,
            title: true,
            correct: true
          },
        },
        userQuestions: {
          select: {
            complete: true,
            sent: true
          }
        },
        userQuestionAnswers: {
          select: {
            questionOptionId: true
          }
        }
      },
    });
    const { questionOptions, userQuestions, userQuestionAnswers, ...userQuestion } = question;
    const isRadio = questionOptions.filter(d => d.correct).length === 1;
    userQuestion.questionOptions = questionOptions.map(d => ({
      id: d.id,
      title: d.title
    }));
    userQuestion.complete = userQuestions?.[0]?.complete;
    userQuestion.sent = userQuestions?.[0]?.sent;
    userQuestion.questionAnswers = userQuestionAnswers.map(d => d.questionOptionId);
    userQuestion.type = isRadio ? 'radio' : 'checkbox';
    res.status(200).send({
      success: true,
      data: userQuestion
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const userSave = async (req, res) => {
  try {
    handlers.validateRequest(req, 'questionId');
    handlers.validateRequest(req, 'questionAnswers');

    const questionId = req.body.questionId;
    const questionAnswers = req.body.questionAnswers;
    const userId = req.user.id;

    await prisma.$transaction(async (tx) => {
      const answersExist = await tx.userQuestionAnswer.findMany({
        where: { questionId }
      })
      const answersCreate = questionAnswers.filter(answer => !answersExist.find(answerExist => answer === answerExist.questionOptionId));
      const answersDelete = answersExist.filter(answerExist => !questionAnswers.find(answer => answer === answerExist.questionOptionId));
      // create
      await tx.userQuestionAnswer.createMany({
        data: answersCreate.map(answerCreate => ({
          questionOptionId: answerCreate,
          questionId,
          userId
        }))
      })
      // delete
      for (const answerDelete of answersDelete) {
        await tx.userQuestionAnswer.delete({
          where: { id: answerDelete.id }
        })
      }
    })

    res.status(200).send({
      success: true
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const userCheck = async (req, res) => {
  try {
    handlers.validateRequest(req, 'blockId');
    handlers.validateRequest(req, 'questions');

    // const blockId = req.body.blockId;
    // const questions = req.body.questions;
    // const userId = req.user.id;

    // await questionService.checkAnswersByBlockIdUser(client, blockId, questions, userId);
    // const { questions: questionsUpdated } = await questionService.getQuestionsByBlockIdUser(client, blockId, userId);
    // await blockService.updateBlockUser(client, id, userId);
    // await moduleService.updateModuleUser(client, id, userId);
    const questionsUpdated = [];

    res.status(200).send({
      success: true,
      data: questionsUpdated
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}

module.exports = {
  list,
  item,
  create,
  update,
  del,

  userList,
  userItem,
  userSave,
  userCheck
}