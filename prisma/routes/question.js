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
    const question = await prisma.$transaction(async (tx) => {
      await tx.question.update({
        where: { id },
        data: {
          blockId: req.body.blockId,
          title: req.body.title,
          position: req.body.position,
        }
      })
      const optionsExist = await tx.questionOption.findMany({
        where: { questionId: id }
      });

      // options create
      const optionsCreate = questionOptions.filter(option => !optionsExist.find(optionExist => option.id === optionExist.id));
      await tx.questionOption.createMany({
        data: optionsCreate.map(d => ({
          questionId: id,
          title: d.title,
          correct: d.correct
        }))
      })

      // options update
      const optionsUpdate = questionOptions.filter(option => optionsExist.find(optionExist => option.id === optionExist.id));
      for (const optionUpdate of optionsUpdate) {
        await tx.questionOption.update({
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
        await tx.questionOption.delete({
          where: { id: optionDelete.id }
        })
      }

      return tx.question.findUnique({
        where: { id },
        include: {
          questionOptions: true
        }
      });
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
    await prisma.$transaction(async (tx) => {
      for (const id of ids) {
        await tx.questionOption.deleteMany({
          where: { questionId: id }
        })
        await tx.question.delete({
          where: { id }
        })
      }
    })
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
    handlers.validateRequest(req, 'userBlockId');
    const userBlockId = req.body.userBlockId;
    const data = await prisma.$transaction(async (tx) => {
      const userQuestions = await prisma.userQuestion.findMany({
        where: { userBlockId },
        include: {
          question: {
            include: {
              questionOptions: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          userQuestionAnswers: true
        },
        orderBy: { question: { position: "asc" } }
      })
      for (const userQuestion of userQuestions) {
        const _count = await tx.questionOption.count({
          where: {
            questionId: userQuestion.question.id,
            correct: true
          }
        })
        userQuestion.question._type = _count === 1 ? 'radio' : 'checkbox';
      }
      return userQuestions;
    });
    res.status(200).send({
      success: true,
      data
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
    const data = await prisma.$transaction(async (tx) => {
      const userQuestion = await prisma.userQuestion.findUnique({
        where: { id },
        include: {
          question: {
            include: {
              questionOptions: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          userQuestionAnswers: true
        },
      })
      const _count = await tx.questionOption.count({
        where: {
          questionId: userQuestion.question.id,
          correct: true
        }
      })
      userQuestion.question._type = _count === 1 ? 'radio' : 'checkbox';
      return userQuestion;
    })
    res.status(200).send({
      success: true,
      data
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const userSave = async (req, res) => {
  try {
    handlers.validateRequest(req, 'userQuestionId');
    handlers.validateRequest(req, 'userQuestionAnswers');
    const userQuestionId = req.body.userQuestionId;
    const userQuestionAnswers = req.body.userQuestionAnswers;
    const userId = req.user.id;
    await prisma.$transaction(async (tx) => {
      const answersExist = await tx.userQuestionAnswer.findMany({
        where: { userQuestionId }
      })
      const answersCreate = userQuestionAnswers.filter(answer => !answersExist.find(answerExist => answer.questionOptionId === answerExist.questionOptionId));
      const answersDelete = answersExist.filter(answerExist => !userQuestionAnswers.find(answer => answer.questionOptionId === answerExist.questionOptionId));
      // create
      await tx.userQuestionAnswer.createMany({
        data: answersCreate.map(answerCreate => ({
          questionOptionId: answerCreate.questionOptionId,
          userId,
          userQuestionId,
          commentText: null
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
    handlers.validateRequest(req, 'userBlockId');
    const userBlockId = req.body.userBlockId;
    await prisma.$transaction(async (tx) => {
      const userQuestions = await tx.userQuestion.findMany({
        where: { userBlockId },
        include: {
          question: {
            include: { questionOptions: true },
          },
          userQuestionAnswers: true
        },
        orderBy: { question: { position: "asc" } }
      })
      let errorQuestions = false;
      for (const userQuestion of userQuestions) {
        const correctIds = userQuestion.question.questionOptions.filter(d => d.correct).map(d => d.id);
        const answerIds = userQuestion.userQuestionAnswers.map(d => d.questionOptionId);
        const error = correctIds.sort().toString() !== answerIds.sort().toString();
        if (error) errorQuestions = true;
        await tx.userQuestion.update({
          where: { id: userQuestion.id },
          data: { complete: true, error }
        })
      }
      await tx.userBlock.update({
        where: { id: userBlockId },
        data: { completeQuestions: true, errorQuestions }
      })
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

const adminList = async (req, res) => {
  try {
    const data = await prisma.$transaction(async (tx) => {
      const userQuestions = await tx.userQuestion.findMany({
        include: {
          user: {
            select: {
              username: true,
              firstname: true,
              lastname: true
            }
          },
          question: {
            include: {
              block: true,
              questionOptions: true,
            },
          },
          userQuestionAnswers: true,
        },
        orderBy: [
          { updatedAt: 'desc' }
        ]
      });
      for (const userQuestion of userQuestions) {
        const _count = await tx.questionOption.count({
          where: {
            questionId: userQuestion.question.id,
            correct: true
          }
        })
        userQuestion.question._type = _count === 1 ? 'radio' : 'checkbox';
      }
      return userQuestions;
    });
    res.status(200).send({
      success: true,
      data
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const adminItem = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await prisma.$transaction(async (tx) => {
      const userQuestion = await tx.userQuestion.findUniqueOrThrow({
        where: { id },
        include: {
          user: {
            select: {
              username: true,
              firstname: true,
              lastname: true
            }
          },
          question: {
            include: {
              block: true,
              questionOptions: true,
            },
          },
          userQuestionAnswers: true,
          userBlock: true
        },
      });
      const _count = await tx.questionOption.count({
        where: {
          questionId: userQuestion.question.id,
          correct: true
        }
      })
      userQuestion.question._type = _count === 1 ? 'radio' : 'checkbox';
      return userQuestion;
    });
    res.status(200).send({
      success: true,
      data
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
  userCheck,

  adminList,
  adminItem
}