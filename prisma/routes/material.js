const handlers = require("../utils/handlers");
const fs = require("fs");
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const list = async (req, res) => {
  try {
    handlers.validateRequest(req, 'blockId');
    const blockId = req.body.blockId;
    const materials = await prisma.material.findMany({
      where: { blockId },
      include: {
        document: {
          include: {
            documentType: true,
            file: true,
          }
        }
      }
    })
    res.status(200).send({
      success: true,
      data: materials
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
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        document: {
          include: {
            documentType: true,
            file: true,
          }
        }
      }
    });
    res.status(200).send({
      success: true,
      data: material
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const create = async (req, res) => {
  try {
    handlers.validateRequest(req, 'blockId',
      'document.documentTypeId', 'document.name', 'document.description');
    const userId = req.user.id;
    const document = await prisma.document.create({
      data: {
        documentTypeId: req.body.document.documentTypeId,
        name: req.body.document.name,
        description: req.body.document.description,
        fileId: req.body.document.fileId,
        url: req.body.document.url,
        userId,
      }
    })
    const material = await prisma.material.create({
      data: {
        blockId: req.body.blockId,
        documentId: document.id
      },
      include: {
        document: {
          include: {
            documentType: true,
            file: true,
          }
        }
      }
    })
    res.status(200).send({
      success: true,
      data: material
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const update = async (req, res) => {
  try {
    handlers.validateRequest(req, 'blockId',
      'document.id', 'document.documentTypeId', 'document.name', 'document.description');
    const id = req.params.id;
    const userId = req.user.id;
    const oldMaterial = await prisma.material.findFirst({
      where: { id },
      include: {
        document: {
          include: {
            documentType: true,
            file: true,
          }
        }
      }
    })
    await prisma.document.update({
      where: { id: req.body.document.id },
      data: {
        documentTypeId: req.body.document.documentTypeId,
        name: req.body.document.name,
        description: req.body.document.description,
        fileId: req.body.document.fileId,
        url: req.body.document.url,
        userId,
      }
    })
    const material = await prisma.material.findFirst({
      where: { id },
      include: {
        document: {
          include: {
            documentType: true,
            file: true,
          }
        }
      }
    })
    if (oldMaterial.document.file) {
      if (oldMaterial.document.file.id !== material.document.file.id) {
        if (fs.existsSync(`./${oldMaterial.document.file.path}`)) {
          fs.unlinkSync(`./${oldMaterial.document.file.path}`);
        }
        await prisma.file.delete({
          where: { id: oldMaterial.document.file.id }
        })
      }
    }
    res.status(200).send({
      success: true,
      data: material
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
      const material = await prisma.material.findUnique({
        where: { id },
        include: {
          document: {
            include: {
              documentType: true,
              file: true,
            }
          }
        }
      });
      await prisma.material.delete({
        where: { id }
      })
      await prisma.document.delete({
        where: { id: material.document.id }
      })
      if (material.document.file) {
        if (fs.existsSync(`./${material.document.file.path}`)) {
          fs.unlinkSync(`./${material.document.file.path}`);
        }
        await prisma.file.delete({
          where: { id: material.document.file.id }
        })
      }
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
    const materials = (await prisma.material.findMany({
      where: { blockId },
      include: {
        document: {
          include: {
            documentType: true,
            file: true,
          }
        },
        userMaterials: {
          select: {
            complete: true
          }
        }
      }
    })).map(item => {
      const { userMaterials, ...userMaterial } = item;
      userMaterial.complete = userMaterials?.[0]?.complete;
      return userMaterial;
    })
    res.status(200).send({
      success: true,
      data: materials
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
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        document: {
          include: {
            documentType: true,
            file: true,
          }
        },
        userMaterials: {
          select: {
            complete: true
          }
        }
      }
    })
    const { userMaterials, ...userMaterial } = material;
    userMaterial.complete = userMaterials?.[0]?.complete;
    res.status(200).send({
      success: true,
      data: userMaterial
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const userUpdate = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        userMaterials: true
      }
    });
    if (material) {
      // update userMaterial.complete
      const userMaterial = material?.userMaterials[0];
      if (userMaterial)
        await prisma.userMaterial.update({
          where: { id: userMaterial.id },
          data: { complete: true }
        });

      // update userBlock.completeMaterials
      const materials = await prisma.userMaterial.findMany({
        where: {
          userId,
          material: {
            blockId: material?.blockId
          }
        }
      });
      const completeMaterials = materials.reduce((prev, curr) => prev && curr.complete, true);
      await prisma.userBlock.updateMany({
        where: { blockId: material.blockId, userId },
        data: { completeMaterials }
      })
    }
    res.status(200).send({
      success: true
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
  userUpdate
}