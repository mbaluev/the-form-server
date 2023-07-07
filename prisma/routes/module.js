const handlers = require("../utils/handlers");
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const list = async (req, res) => {
  try {
    const search = req.body.search || '';
    const modules = await prisma.module.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
        ]
      },
      orderBy: {
        position: 'asc'
      }
    });
    res.status(200).send({
      success: true,
      data: modules
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
    const blockId = req.body.blockId;
    if (blockId) {
      const module = await prisma.module.findFirst({
        where: {
          blocks: {
            some: {
              blockId
            }
          }
        }
      })
      res.status(200).send({
        success: true,
        data: module
      });
    } else {
      const module = await prisma.module.findFirst({
        where: { id }
      })
      res.status(200).send({
        success: true,
        data: module
      });
    }
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const create = async (req, res) => {
  try {
    handlers.validateRequest(req, 'title', 'name', 'position');
    const module = await prisma.module.create({
      data: {
        title: req.body.title,
        name: req.body.name,
        position: Number(req.body.position)
      }
    });
    res.status(200).send({
      success: true,
      data: module
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
    const module = await prisma.module.update({
      where: { id },
      data: {
        title: req.body.title,
        name: req.body.name,
        position: Number(req.body.position)
      }
    });
    res.status(200).send({
      success: true,
      data: module
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
    await prisma.module.deleteMany({
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

const userList = async (req, res) => {
  try {
    const userId = req.user.id;
    const modules = await prisma.module.findMany({
      orderBy: {
        position: 'asc'
      }
    });
    const userModules = [];
    for (const module of modules) {
      const userModule = await prisma.userModule.findFirst({
        where: {
          userId,
          moduleId: module.id
        }
      })
      const blocks = await prisma.block.findMany({
        where: {
          moduleId: module.id
        },
        orderBy: {
          position: 'asc'
        }
      })
      for (const block of blocks) {
        const userBlock = await prisma.userBlock.findFirst({
          where: { blockId: block.id }
        })
        block.enable = userBlock?.enable
        block.complete = userBlock?.complete
        block.completeMaterials = userBlock?.completeMaterials
        block.completeQuestions = userBlock?.completeQuestions
        block.completeTasks = userBlock?.completeTasks
        block.errorQuestions = userBlock?.errorQuestions
        block.commentQuestions = userBlock?.commentQuestions
      }
      userModules.push({
        ...module,
        enable: userModule?.enable || false,
        complete: userModule?.complete || false,
        blocks
      })
    }
    res.status(200).send({
      success: true,
      data: userModules
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
    const blockId = req.body.blockId;
    const userId = req.user.id;
    if (blockId) {
      const block = await prisma.block.findUnique({
        where: { id: blockId }
      })
      const module = await prisma.module.findUnique({
        where: { id: block?.moduleId }
      });
      const userModule = await prisma.userModule.findFirst({
        where: { userId, moduleId: module.id }
      });
      const blocks = await prisma.block.findMany({
        where: { moduleId: module.id },
        orderBy: {
          position: 'asc'
        }
      })
      for (const block of blocks) {
        const userBlock = await prisma.userBlock.findFirst({
          where: { blockId: block.id }
        })
        block.enable = userBlock?.enable
        block.complete = userBlock?.complete
        block.completeMaterials = userBlock?.completeMaterials
        block.completeQuestions = userBlock?.completeQuestions
        block.completeTasks = userBlock?.completeTasks
        block.errorQuestions = userBlock?.errorQuestions
        block.commentQuestions = userBlock?.commentQuestions
      }
      module.enable = userModule?.enable
      module.complete = userModule?.complete
      module.blocks = blocks;
      res.status(200).send({
        success: true,
        data: module
      });
    } else if (id) {
      const module = await prisma.module.findFirst({
        where: { id }
      });
      const userModule = await prisma.userModule.findFirst({
        where: { userId, moduleId: id }
      });
      const blocks = await prisma.block.findMany({
        where: { moduleId: id },
        orderBy: {
          position: 'asc'
        }
      })
      for (const block of blocks) {
        const userBlock = await prisma.userBlock.findFirst({
          where: { blockId: block.id }
        })
        block.enable = userBlock?.enable
        block.complete = userBlock?.complete
        block.completeMaterials = userBlock?.completeMaterials
        block.completeQuestions = userBlock?.completeQuestions
        block.completeTasks = userBlock?.completeTasks
        block.errorQuestions = userBlock?.errorQuestions
      }
      module.enable = userModule?.enable
      module.complete = userModule?.complete
      module.blocks = blocks;
      res.status(200).send({
        success: true,
        data: module
      });
    }
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
}