const handlers = require("../utils/handlers");
const crypto = require("crypto");
const cryptoPass = require("../utils/cryptoPass");
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const list = async (req, res) => {
  try {
    const users = await prisma.user.findMany({});
    res.status(200).send({
      success: true,
      data: users
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
    const user = await prisma.user.findUnique({
      where: { id }
    });
    res.status(200).send({
      success: true,
      data: user
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }

}
const create = async (req, res) => {
  try {
    handlers.validateRequest(req, 'firstname', 'lastname', 'username', 'password');
    const dataSalt = crypto.randomBytes(16).toString('hex');
    const dataPassword = cryptoPass(dataSalt, req.body.password);
    const user = await prisma.user.create({
      data: {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        password: dataPassword,
        salt: dataSalt,
        active: req.body.active || false,
        paid: req.body.paid || false,
        admin: req.body.admin || false
      }
    })
    const { password, salt, refreshToken, ...userResponse } = user
    res.status(200).send({
      success: true,
      data: userResponse
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const update = async (req, res) => {
  try {
    const id = req.params.id
    const user = await prisma.user.update({
      where: { id },
      data: {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        active: req.body.active,
        paid: req.body.paid,
        admin: req.body.admin
      }
    })
    const { password, salt, refreshToken, ...userResponse } = user
    res.status(200).send({
      success: true,
      data: userResponse
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
    const ids = req.body.ids.map(id => ({ id }));
    await prisma.user.deleteMany({
      where: { OR: ids }
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

const adminList = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        userModules: {
          include: {
            module: true,
            userBlocks: {
              include: {
                block: true
              }
            }
          },
        },
      },
      orderBy: [
        { username: 'asc' },
      ]
    })
    res.status(200).send({
      success: true,
      data: users
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}

const me = async (req, res) => {
  const { password, salt, refreshToken, ...user } = req.user
  res.send(user);
}

const checkTables = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // create userModule
    const modules = await prisma.module.findMany({});
    for (const module of modules) {
      let userModule = await prisma.userModule.findFirst({
        where: { moduleId: module.id, userId }
      });
      if (!userModule) {
        userModule = await prisma.userModule.create({
          data: {
            moduleId: module.id,
            userId,
            enable: false,
            complete: false
          }
        })
      }

      // create userBlock
      const blocks = await prisma.block.findMany({
        where: { moduleId: module.id }
      })
      for (const block of blocks) {
        let userBlock = await prisma.userBlock.findFirst({
          where: { blockId: block.id, userId, userModuleId: userModule.id }
        });
        if (!userBlock) {
          userBlock = await prisma.userBlock.create({
            data: {
              blockId: block.id,
              userId,
              userModuleId: userModule.id,
              enable: false,
              complete: false,
              completeMaterials: false,
              completeQuestions: false,
              completeTasks: false,
            }
          })
        }

        // create userMaterial
        const materials = await prisma.material.findMany({
          where: { blockId: block.id }
        })
        for (const material of materials) {
          const userMaterial = await prisma.userMaterial.findFirst({
            where: { materialId: material.id, userId, userBlockId: userBlock.id }
          });
          if (!userMaterial) {
            await prisma.userMaterial.create({
              data: {
                materialId: material.id,
                userId,
                userBlockId: userBlock.id,
                complete: null,
              }
            })
          }
        }

        // create userTask
        const tasks = await prisma.task.findMany({
          where: { blockId: block.id }
        })
        for (const task of tasks) {
          const userTask = await prisma.userTask.findFirst({
            where: { taskId: task.id, userId, userBlockId: userBlock.id }
          });
          if (!userTask) {
            await prisma.userTask.create({
              data: {
                taskId: task.id,
                userId,
                userBlockId: userBlock.id,
                complete: null,
              }
            })
          }
        }

        // create userQuestion
        const questions = await prisma.question.findMany({
          where: { blockId: block.id }
        })
        for (const question of questions) {
          const userQuestion = await prisma.userQuestion.findFirst({
            where: { questionId: question.id, userId, userBlockId: userBlock.id }
          });
          if (!userQuestion) {
            await prisma.userQuestion.create({
              data: {
                questionId: question.id,
                userId,
                userBlockId: userBlock.id,
                complete: null,
                error: null,
                comment: null
              }
            })
          }
        }
      }
    }
    next();
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const checkBlocksComplete = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await prisma.$connect();
    const userBlocks = await prisma.userBlock.findMany({
      where: { userId },
      include: {
        userMaterials: true,
        userTasks: true,
        userQuestions: true,
      }
    })
    for (const userBlock of userBlocks) {
      const hasMaterials = userBlock.userMaterials.length > 0
      const hasTasks = userBlock.userTasks.length > 0
      const hasQuestions = userBlock.userQuestions.length > 0

      const completeMaterials = !hasMaterials ? false : userBlock.userMaterials.reduce((prev, curr) => {
        return prev && Boolean(curr.complete)
      }, true);
      const completeTasks = !hasTasks ? false : userBlock.userTasks.reduce((prev, curr) => {
        return prev && Boolean(curr.complete)
      }, true);
      const completeQuestions = !hasQuestions ? false : userBlock.userQuestions.reduce((prev, curr) => {
        return prev && Boolean(curr.complete)
      }, true);

      const complete = Boolean(completeMaterials && completeTasks && completeQuestions);
      if (complete !== userBlock.complete ||
          completeMaterials !== userBlock.completeMaterials ||
          completeTasks !== userBlock.completeTasks ||
          completeQuestions !== userBlock.completeQuestions) {
        await prisma.userBlock.update({
          where: { id: userBlock.id },
          data: {
            complete,
            completeMaterials,
            completeTasks,
            completeQuestions
          }
        })
      }
    }
    next();
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const checkModulesComplete = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await prisma.$connect();
    const userModules = await prisma.userModule.findMany({
      where: { userId },
      include: {
        userBlocks: true
      },
    })
    for (const userModule of userModules) {
      const hasBlocks = userModule.userBlocks.length > 0
      const complete = !hasBlocks ? false : userModule.userBlocks.reduce((prev, curr) => {
        return prev && Boolean(curr.complete)
      }, true);
      await prisma.userModule.update({
        where: { id: userModule.id },
        data: { complete }
      })
    }
    next();
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const nextModuleEnable = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await prisma.$connect();
    const userModules = await prisma.userModule.findMany({
      where: { userId },
      include: { module: true },
      orderBy: { module: { position: 'asc' } }
    })
    // check first
    await prisma.userModule.update({
      where: { id: userModules[0].id },
      data: { enable: true }
    })
    // check next
    for (const userModule of userModules) {
      if (userModule.complete) {
        const nextUserModule = await prisma.userModule.findFirst({
          where: { userId, module: { is: { position: { gt: userModule.module.position } } } },
          orderBy: { module: { position: 'asc' } }
        })
        if (nextUserModule) {
          await prisma.userModule.update({
            where: { id: nextUserModule.id },
            data: { enable: true }
          })
        }
      }
    }
    next();
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const nextBlockEnable = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await prisma.$connect();
    const userModule = await prisma.userModule.findFirst({
      where: { userId, enable: true, complete: false },
      include: {
        module: true,
        userBlocks: {
          include: { block: true },
          orderBy: { block: { position: 'asc' } }
        },
      },
      orderBy: { module: { position: 'asc' } }
    })
    // check first
    await prisma.userBlock.update({
      where: { id: userModule.userBlocks[0].id },
      data: { enable: true }
    })
    // check next
    for (const userBlock of userModule.userBlocks) {
      if (userBlock.complete) {
        const nextUserBlock = await prisma.userBlock.findFirst({
          where: {
            userId,
            userModuleId: userModule.id,
            block: { is: { position: { gt: userBlock.block.position } } }
          },
          orderBy: { block: { position: 'asc' } }
        })
        if (nextUserBlock) {
          await prisma.userBlock.update({
            where: { id: nextUserBlock.id },
            data: { enable: true }
          })
        }
      }
    }
    next();
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
  adminList,
  me,
  checkTables,
  checkBlocksComplete,
  checkModulesComplete,
  nextBlockEnable,
  nextModuleEnable,
}