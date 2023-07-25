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
    if (blockId) {
      const module = await prisma.module.findFirst({
        where: { blocks: { some: { blockId } } }
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
    const userBlockId = req.body.userBlockId;
    const userId = req.user.id;
    if (userBlockId) {
      const userModule = await prisma.userModule.findFirst({
        where: { userId, userBlocks: { some: { id: userBlockId } } },
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
    } else {
      const userModule = await prisma.userModule.findFirst({
        where: { id, userId },
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
    }
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}

const adminList = async (req, res) => {
  try {
    const userId = req.body.userId;
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
const adminItem = async (req, res) => {
  try {
    const id = req.params.id;
    const userBlockId = req.body.userBlockId;
    if (userBlockId) {
      const userModule = await prisma.userModule.findFirst({
        where: { userBlocks: { some: { id: userBlockId } } },
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
    } else {
      const userModule = await prisma.userModule.findFirst({
        where: { id },
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
  adminList,
  adminItem
}