const handlers = require("../utils/handlers");
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const list = async (req, res) => {
  try {
    handlers.validateRequest(req, 'blockId');
    const blockId = req.body.blockId;
    const tasks = await prisma.task.findMany({
      where: { blockId },
      include: {
        document: {
          include: {
            documentType: true,
          }
        }
      }
    })
    res.status(200).send({
      success: true,
      data: tasks
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
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        document: {
          include: {
            documentType: true,
          }
        }
      }
    });
    res.status(200).send({
      success: true,
      data: task
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
      'document.documentTypeId', 'document.name');
    const userId = req.user.id;
    const task = await prisma.$transaction(async (tx) => {
      const document = await tx.document.create({
        data: {
          documentTypeId: req.body.document.documentTypeId,
          name: req.body.document.name,
          description: req.body.document.description,
          userId,
        }
      })
      return await tx.task.create({
        data: {
          blockId: req.body.blockId,
          documentId: document.id,
        },
        include: {
          document: {
            include: {
              documentType: true,
            }
          }
        }
      })
    })
    res.status(200).send({
      success: true,
      data: task
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
      'document.id', 'document.documentTypeId');
    const id = req.params.id;
    const userId = req.user.id;
    const task = await prisma.$transaction(async (tx) => {
      await tx.document.update({
        where: { id: req.body.document.id },
        data: {
          documentTypeId: req.body.document.documentTypeId,
          name: req.body.document.name,
          userId,
        }
      })
      return tx.task.findFirst({
        where: { id },
        include: {
          document: {
            include: {
              documentType: true,
            }
          }
        }
      })
    });
    res.status(200).send({
      success: true,
      data: task
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
        const task = await tx.task.findUnique({
          where: { id },
          include: {
            document: {
              include: {
                documentType: true,
              }
            }
          }
        });
        await tx.task.delete({
          where: { id }
        })
        await tx.document.delete({
          where: { id: task.document.id }
        })
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
    const userTasks = await prisma.userTask.findMany({
      where: { userBlockId },
      include: {
        task: {
          include: {
            document: {
              include: {
                documentType: true,
                file: true
              }
            },
          }
        },
        userTaskDocuments: {
          include: {
            document: {
              include: {
                documentType: true,
                file: true
              }
            }
          },
          orderBy: { updatedAt: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })
    res.status(200).send({
      success: true,
      data: userTasks
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
    const userTask = await prisma.userTask.findUnique({
      where: { id },
      include: {
        task: {
          include: {
            document: {
              include: {
                documentType: true,
                file: true
              }
            },
          }
        },
        userTaskDocuments: {
          include: {
            document: {
              include: {
                documentType: true,
                file: true
              }
            }
          },
          orderBy: { updatedAt: 'desc' }
        }
      }
    })
    res.status(200).send({
      success: true,
      data: userTask
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const userSent = async (req, res) => {
  try {
    handlers.validateRequest(
      req,
      'userTaskId',
      'document.documentTypeId',
      'document.name',
      'document.description'
    );
    const userId = req.user.id;
    const userTaskId = req.body.userTaskId;
    const userTask = await prisma.$transaction(async (tx) => {
      // create document
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
      await tx.userTaskDocument.create({
        data: {
          userTaskId,
          documentId: document.id,
          userId,
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

      // update userTask
      const userTask = await tx.userTask.update({
        where: { id: userTaskId },
        data: { sent: true },
        include: {
          task: {
            include: {
              document: {
                include: {
                  documentType: true,
                  file: true
                }
              },
            }
          },
          userTaskDocuments: {
            include: {
              document: {
                include: {
                  documentType: true,
                  file: true
                }
              }
            },
          }
        }
      })

      // update userBlock
      const userBlock = await tx.userBlock.findUnique({
        where: { id: userTask?.userBlockId }
      })
      const userTasks = await tx.userTask.findMany({
        where: { userBlockId: userBlock?.id }
      })
      let sentTasksUser = null;
      let sentTasksAdmin = null;
      userTasks.forEach((item) => {
        if (!item.complete && item.sent === true) sentTasksUser = true;
        if (!item.complete && item.sent === false) sentTasksAdmin = true;
      })
      await tx.userBlock.update({
        where: { id: userBlock?.id },
        data: { sentTasksUser, sentTasksAdmin }
      })

      return userTask;
    })
    res.status(200).send({
      success: true,
      data: userTask
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}

const adminList = async (req, res) => {
  try {
    handlers.validateRequest(req, 'userBlockId');
    const userBlockId = req.body.userBlockId;
    const userTasks = await prisma.userTask.findMany({
      where: { userBlockId },
      include: {
        user: {
          select: {
            username: true,
            firstname: true,
            lastname: true
          }
        },
        task: {
          include: {
            block: true,
            document: {
              include: {
                documentType: true,
                file: true
              }
            },
          }
        },
        userTaskDocuments: {
          include: {
            document: {
              include: {
                documentType: true,
                file: true
              }
            }
          },
          orderBy: { updatedAt: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })
    res.status(200).send({
      success: true,
      data: userTasks
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
    const userTask = await prisma.userTask.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            firstname: true,
            lastname: true
          }
        },
        task: {
          include: {
            block: true,
            document: {
              include: {
                documentType: true,
                file: true
              }
            },
          }
        },
        userTaskDocuments: {
          include: {
            document: {
              include: {
                documentType: true,
                file: true
              }
            }
          },
          orderBy: { updatedAt: 'desc' }
        }
      }
    })
    res.status(200).send({
      success: true,
      data: userTask
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const adminSent = async (req, res) => {
  try {
    handlers.validateRequest(
      req,
      'userTaskId',
      'document.documentTypeId',
      'document.name',
      'document.description'
    );
    const userId = req.user.id;
    const userTaskId = req.body.userTaskId;
    const userTask = await prisma.$transaction(async (tx) => {
      // create document
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
      await tx.userTaskDocument.create({
        data: {
          userTaskId,
          documentId: document.id,
          userId,
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

      // update userTask
      const userTask = await tx.userTask.update({
        where: { id: userTaskId },
        data: { sent: false },
        include: {
          task: {
            include: {
              document: {
                include: {
                  documentType: true,
                  file: true
                }
              },
            }
          },
          userTaskDocuments: {
            include: {
              document: {
                include: {
                  documentType: true,
                  file: true
                }
              }
            },
          }
        }
      })

      // update userBlock
      const userBlock = await tx.userBlock.findUnique({
        where: { id: userTask?.userBlockId }
      })
      const userTasks = await tx.userTask.findMany({
        where: { userBlockId: userBlock?.id }
      })
      let sentTasksUser = null;
      let sentTasksAdmin = null;
      userTasks.forEach((item) => {
        if (!item.complete && item.sent === true) sentTasksUser = true;
        if (!item.complete && item.sent === false) sentTasksAdmin = true;
      })
      await tx.userBlock.update({
        where: { id: userBlock?.id },
        data: { sentTasksAdmin, sentTasksUser }
      })

      return userTask;
    })
    res.status(200).send({
      success: true,
      data: userTask
    });
  } catch (err) {
    await handlers.errorHandler(res, err);
  } finally {
    await prisma.$disconnect()
  }
}
const adminComplete = async (req, res) => {
  try {
    const id = req.params.id;
    await prisma.$transaction(async (tx) => {
      // update userTask
      const userTask = await tx.userTask.update({
        where: { id },
        data: { complete: true }
      })

      // update userBlock
      const userBlock = await tx.userBlock.findUnique({
        where: { id: userTask?.userBlockId }
      })
      const userTasks = await tx.userTask.findMany({
        where: { userBlockId: userBlock?.id }
      })
      let sentTasksUser = null;
      let sentTasksAdmin = null;
      userTasks.forEach((item) => {
        if (!item.complete && item.sent === true) sentTasksUser = true;
        if (!item.complete && item.sent === false) sentTasksAdmin = true;
      })
      await tx.userBlock.update({
        where: { id: userBlock?.id },
        data: { sentTasksUser, sentTasksAdmin }
      })
    })
    await adminItem(req, res);
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
  userSent,

  adminList,
  adminItem,
  adminSent,
  adminComplete
}