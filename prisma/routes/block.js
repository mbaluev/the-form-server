const handlers = require("../utils/handlers");
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const list = async (req, res) => {
  try {
    const search = req.body.search || '';
    const moduleId = req.body.moduleId;
    const blocks = await prisma.block.findMany({
      where: {
        AND: [
          { moduleId },
          {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { title: { contains: search, mode: 'insensitive' } },
            ]
          }
        ]
      },
      orderBy: [
        { module: { position: "asc" } },
        { position: 'asc' }
      ]
    });
    res.status(200).send({
      success: true,
      data: blocks
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
    const block = await prisma.block.findFirst({
      where: { id }
    });
    res.status(200).send({
      success: true,
      data: block
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const create = async (req, res) => {
  try {
    handlers.validateRequest(req, 'moduleId', 'title', 'name', 'position');
    const block = await prisma.block.create({
      data: {
        moduleId: req.body.moduleId,
        title: req.body.title,
        name: req.body.name,
        position: Number(req.body.position),
      }
    });
    res.status(200).send({
      success: true,
      data: block
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const update = async (req, res) => {
  try {
    const id = req.params.id;
    const block = await prisma.block.update({
      where: { id },
      data: {
        moduleId: req.body.moduleId,
        title: req.body.title,
        name: req.body.name,
        position: Number(req.body.position),
      }
    });
    res.status(200).send({
      success: true,
      data: block
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
    await prisma.block.deleteMany({
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

const userItem = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const userBlock = await prisma.userBlock.findFirst({
      where: { id, userId },
      include: { block: true }
    })
    res.status(200).send({
      success: true,
      data: userBlock
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}

const adminList = async (req, res) => {
  try {
    const userModuleId = req.body.userModuleId;
    const userBlocks = await prisma.userBlock.findMany({
      where: { userModuleId },
      include: {
        user: true,
        block: {
          include: { module: true },
        },
      },
      orderBy: [
        { block: { module: { position: "asc" } } },
        { block: { position: 'asc' } },
        { user: { username: 'asc' } },
      ]
    })
    res.status(200).send({
      success: true,
      data: userBlocks
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
    const userBlock = await prisma.userBlock.findFirst({
      where: { id },
      include: {
        user: true,
        block: {
          include: { module: true },
        }
      },
    })
    res.status(200).send({
      success: true,
      data: userBlock
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
  userItem,
  adminList,
  adminItem
}