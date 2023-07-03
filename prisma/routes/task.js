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
    const document = await prisma.document.create({
      data: {
        documentTypeId: req.body.document.documentTypeId,
        name: req.body.document.name,
        description: req.body.document.description,
        userId,
      }
    })
    const task = await prisma.task.create({
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
    await prisma.document.update({
      where: { id: req.body.document.id },
      data: {
        documentTypeId: req.body.document.documentTypeId,
        name: req.body.document.name,
        userId,
      }
    })
    const task = await prisma.task.findFirst({
      where: { id },
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
    for (const id of ids) {
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
      await prisma.task.delete({
        where: { id }
      })
      await prisma.document.delete({
        where: { id: task.document.id }
      })
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
    const tasks = (await prisma.task.findMany({
      where: { blockId },
      include: {
        document: {
          include: {
            documentType: true,
          }
        },
        userTasks: {
          select: {
            complete: true,
            sent: true
          }
        }
      }
    })).map(item => {
      const { userTasks, ...userTask } = item;
      userTask.complete = userTasks?.[0]?.complete;
      userTask.sent = userTasks?.[0]?.sent;
      return userTask;
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
const userItem = async (req, res) => {
  try {
    const id = req.params.id;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        document: {
          include: {
            documentType: true,
          }
        },
        userTasks: {
          select: {
            complete: true,
            sent: true
          }
        },
        userTaskDocuments: {
          include: {
            document: {
              include: {
                documentType: true,
                file: true
              }
            },
            user: {
              select: {
                username: true,
                firstname: true,
                lastname: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })
    const { userTasks, ...userTask } = task;
    userTask.complete = userTasks?.[0]?.complete;
    userTask.sent = userTasks?.[0]?.sent;
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
    handlers.validateRequest(req, 'taskId', 'sent',
      'document.documentTypeId', 'document.name', 'document.description');
    const userId = req.user.id;
    const userTask = await prisma.$transaction(async (tx) => {
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
      const userTaskDocument = await tx.userTaskDocument.create({
        data: {
          taskId: req.body.taskId,
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
      await tx.userTask.updateMany({
        where: {
          taskId: req.body.taskId,
          userId
        },
        data: { sent: req.body.sent }
      })

      const task = await tx.task.findUnique({
        where: { id: req.body.taskId },
        include: {
          document: {
            include: {
              documentType: true,
            }
          },
          userTasks: {
            select: {
              complete: true,
              sent: true
            }
          }
        }
      })
      const { userTasks, ...userTask } = task;
      userTask.complete = userTasks?.[0]?.complete;
      userTask.sent = userTasks?.[0]?.sent;
      userTask.userTaskDocument = userTaskDocument;
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
    const tasks = await prisma.$transaction(async (tx) => {
      const userTasks = await tx.userTask.findMany({
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
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
      for (const userTask of userTasks) {
        userTask.userTaskDocuments = await tx.userTaskDocument.findMany({
          where: {
            taskId: userTask.taskId
          },
          include: {
            document: {
              include: {
                documentType: true,
                file: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
      }
      return userTasks;
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
const adminItem = async (req, res) => {
  try {
    const id = req.params.id;
    const task = await prisma.$transaction(async (tx) => {
      const userTask = await tx.userTask.findUnique({
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
        }
      });
      userTask.userTaskDocuments = await tx.userTaskDocument.findMany({
        where: {
          taskId: userTask.taskId
        },
        include: {
          user: {
            select: {
              username: true,
              firstname: true,
              lastname: true
            }
          },
          document: {
            include: {
              documentType: true,
              file: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return userTask;
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
const adminComplete = async (req, res) => {
  try {
    const id = req.params.id;
    await prisma.userTask.update({
      where: { id },
      data: { complete: true }
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
  adminComplete
}