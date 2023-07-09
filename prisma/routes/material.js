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
    const material = await prisma.$transaction(async (tx) => {
      const document = await tx.document.create({
        data: {
          documentTypeId: req.body.document.documentTypeId,
          name: req.body.document.name,
          description: req.body.document.description,
          fileId: req.body.document.fileId,
          url: req.body.document.url,
          userId,
        }
      })
      return tx.material.create({
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
    const material = await prisma.$transaction(async (tx) => {
      const oldMaterial = await tx.material.findFirst({
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
      await tx.document.update({
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
      const newMaterial = await tx.material.findFirst({
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
        if (oldMaterial.document.file.id !== newMaterial.document.file.id) {
          if (fs.existsSync(`./${oldMaterial.document.file.path}`)) {
            fs.unlinkSync(`./${oldMaterial.document.file.path}`);
          }
          await tx.file.delete({
            where: { id: oldMaterial.document.file.id }
          })
        }
      }
      return newMaterial;
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
const del = async (req, res) => {
  try {
    handlers.validateRequest(req, 'ids');
    const ids = req.body.ids;
    await prisma.$transaction(async (tx) => {
      for (const id of ids) {
        const material = await tx.material.findUnique({
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
        await tx.material.delete({
          where: { id }
        })
        await tx.document.delete({
          where: { id: material.document.id }
        })
        if (material.document.file) {
          if (fs.existsSync(`./${material.document.file.path}`)) {
            fs.unlinkSync(`./${material.document.file.path}`);
          }
          await tx.file.delete({
            where: { id: material.document.file.id }
          })
        }
      }
    });
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
    const userMaterials = await prisma.userMaterial.findMany({
      where: { userBlockId },
      include: {
        material: {
          include: {
            document: {
              include: {
                documentType: true,
                file: true,
              }
            },
          }
        },
      }
    })
    res.status(200).send({
      success: true,
      data: userMaterials
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
    const userMaterial = await prisma.userMaterial.findUnique({
      where: { id },
      include: {
        material: {
          include: {
            document: {
              include: {
                documentType: true,
                file: true,
              }
            },
          }
        },
      }
    })
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
    await prisma.userMaterial.update({
      where: { id },
      data: { complete: true },
      include: { userBlock: true }
    });
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