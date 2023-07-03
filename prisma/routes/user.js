const handlers = require("../utils/handlers");
const crypto = require("crypto");
const cryptoPass = require("../utils/cryptoPass");
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const list = async (req, res) => {
  try {
    const search = req.body.search || '';
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { firstname: { contains: search, mode: 'insensitive' } },
          { lastname: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
        ]
      }
    });
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

const me = async (req, res) => {
  res.send(req.user);
}

const checkTables = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // create userModule
    const modules = await prisma.module.findMany({});
    const userModules = await prisma.userModule.findMany({
      where: { userId }
    });
    for (const module of modules) {
      const userModule = userModules.find(d => d.moduleId === module.id);
      if (!userModule) {
        await prisma.userModule.create({
          data: {
            moduleId: module.id,
            userId,
            enable: false,
            complete: false
          }
        })
      }
    }

    // create userBlock
    const blocks = await prisma.block.findMany({})
    const userBlocks = await prisma.userBlock.findMany({
      where: { userId }
    });
    for (const block of blocks) {
      const userBlock = userBlocks.find(d => d.blockId === block.id);
      if (!userBlock) {
        await prisma.userBlock.create({
          data: {
            blockId: block.id,
            userId,
            enable: false,
            complete: false,
            completeMaterials: false,
            completeQuestions: false,
            completeTasks: false,
          }
        })
      }
    }

    // create userMaterial
    const materials = await prisma.material.findMany({})
    const userMaterials = await prisma.userMaterial.findMany({
      where: { userId }
    });
    for (const material of materials) {
      const userMaterial = userMaterials.find(d => d.materialId === material.id);
      if (!userMaterial) {
        await prisma.userMaterial.create({
          data: {
            materialId: material.id,
            userId,
            complete: null,
          }
        })
      }
    }

    // create userTask
    const tasks = await prisma.task.findMany({})
    const userTasks = await prisma.userTask.findMany({
      where: { userId }
    });
    for (const task of tasks) {
      const userTask = userTasks.find(d => d.taskId === task.id);
      if (!userTask) {
        await prisma.userTask.create({
          data: {
            taskId: task.id,
            userId,
            complete: null,
          }
        })
      }
    }

    // create userQuestion
    const questions = await prisma.question.findMany({})
    const userQuestions = await prisma.userQuestion.findMany({
      where: { userId }
    });
    for (const question of questions) {
      const userQuestion = userQuestions.find(d => d.questionId === question.id);
      if (!userQuestion) {
        await prisma.userQuestion.create({
          data: {
            questionId: question.id,
            userId,
            complete: null,
            error: null
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
const checkBlocksComplete = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userBlocks = await prisma.userBlock.findMany({
      where: { userId }
    })
    for (const userBlock of userBlocks) {
      const userMaterials = await prisma.userMaterial.findMany({
        where: {
          userId,
          material: {
            is: {
              blockId: userBlock?.blockId
            }
          }
        }
      })
      const userTasks = await prisma.userTask.findMany({
        where: {
          userId,
          task: {
            is: {
              blockId: userBlock?.blockId
            }
          }
        }
      })
      const userQuestions = await prisma.userQuestion.findMany({
        where: {
          userId,
          question: {
            is: {
              blockId: userBlock?.blockId
            }
          }
        }
      })

      const hasMaterials = userMaterials.length > 0
      const hasTasks = userTasks.length > 0
      const hasQuestions = userQuestions.length > 0

      const completeMaterials = !hasMaterials ? false : userMaterials.reduce((prev, curr) => {
        return prev && Boolean(curr.complete)
      }, true);
      const completeTasks = !hasTasks ? false : userTasks.reduce((prev, curr) => {
        return prev && Boolean(curr.complete)
      }, true);
      const completeQuestions = !hasQuestions ? false : userQuestions.reduce((prev, curr) => {
        return prev && Boolean(curr.complete)
      }, true);

      const complete = Boolean(completeMaterials && completeTasks && completeQuestions);
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
    const userModules = await prisma.userModule.findMany({
      include: {
        module: {
          include: {
            blocks: {
              include: {
                userBlocks: true
              }
            }
          }
        }
      },
      where: { userId },
      orderBy: {
        module: {
          position: 'asc'
        }
      }
    })
    for (const userModule of userModules) {
      const userBlocks = await prisma.userBlock.findMany({
        where: {
          userId,
          block: {
            is: {
              moduleId: userModule?.moduleId
            }
          }
        }
      })
      const hasBlocks = userBlocks.length > 0
      const complete = !hasBlocks ? false : userBlocks.reduce((prev, curr) => {
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
    const userModule = await prisma.userModule.findFirst({
      where: { userId, enable: true, complete: false },
      include: { module: true },
      orderBy: { module: { position: 'asc' } }
    })
    const userBlocks = await prisma.userBlock.findMany({
      include: { block: true },
      where: { userId, block: { is: { moduleId: userModule.module.id } } },
      orderBy: { block: { position: 'asc' } }
    })
    // check first
    await prisma.userBlock.update({
      where: { id: userBlocks[0].id },
      data: { enable: true }
    })
    // check next
    for (const userBlock of userBlocks) {
      if (userBlock.complete) {
        const nextUserBlock = await prisma.userBlock.findFirst({
          where: { userId, block: { is: { position: { gt: userBlock.block.position } } } },
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
  me,
  checkTables,
  checkBlocksComplete,
  checkModulesComplete,
  nextBlockEnable,
  nextModuleEnable,
}