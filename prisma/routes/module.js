const handlers = require("../utils/handlers");
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const list = async (req, res) => {
  try {
    const modules = await prisma.module.findMany({
      orderBy: { position: 'asc' }
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
    const module = await prisma.module.findFirst({
      where: {
        id,
        blocks: { some: { blockId } }
      }
    })
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
    const userModules = await prisma.userModule.findMany({
      where: { userId },
      include: {
        module: true,
        userBlocks: {
          include: { block: true },
          orderBy: { block: { position: "asc" } }
        },
      },
      orderBy: { module: { position: "asc" } }
    })
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
    const userModule = await prisma.userModule.findFirst({
      where: {
        id,
        userId,
        userBlocks: { some: { blockId } }
      },
      include: {
        module: true,
        userBlocks: {
          include: { block: true },
          orderBy: { block: { position: "asc" } }
        },
      },
      orderBy: { module: { position: "asc" } }
    })
    res.status(200).send({
      success: true,
      data: userModule
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
}