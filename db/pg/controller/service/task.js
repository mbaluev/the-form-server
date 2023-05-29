const taskEntity = require("../table/task");
const documentEntity = require("../table/document");
const fileEntity = require("../table/file");
const taskDocumentEntity = require("../table/taskDocument");
const taskLinkEntity = require("../table/taskLink");
const userTaskHistoryEntity = require("../table/userTaskHistory");
const userEntity = require("../table/user");
const fs = require("fs");

const getTaskInfo = async (client, taskData) => {
  try {
    const { documentId, userTaskId, ...task } = taskData
    const { fileId, ...document } = await documentEntity.get(client, { id: documentId });
    document.file = await fileEntity.get(client, { id: fileId });
    const taskDocuments = (await taskDocumentEntity.list(client, { taskId: task.id })).map(d => {
      return {
        id: d.id,
        title: d.title,
        type: 'file'
      }
    });
    const taskLinks = (await taskLinkEntity.list(client, { taskId: task.id })).map(d => {
      return {
        id: d.id,
        title: d.title,
        type: 'link'
      }
    });
    const taskHistoryRaw = await userTaskHistoryEntity.list(client, { userTaskId });
    const taskHistory = [];
    for (const taskHistoryRawItem of taskHistoryRaw) {
      const { id, userTaskDocumentId, userId, date} = taskHistoryRawItem;
      const taskHistoryItem = { id, date };
      const { fileId, ...document } = await documentEntity.get(client, { id: userTaskDocumentId });
      document.file = await fileEntity.get(client, { id: fileId });
      const { firstname, lastname, username } = await userEntity.get(client, { id: userId });
      taskHistoryItem.document = document;
      taskHistoryItem.user = { id: userId, firstname, lastname, username };
    }
    task.document = document;
    task.taskAnswers = taskDocuments.concat(taskLinks);
    if (taskHistory.length === 0) task.taskLatest = { document }
    else task.taskLatest = taskHistory.shift()
    task.taskHistory = taskHistory
    return { task };
  } catch (err) {
    throw err;
  }
}

const getTasksByBlockId = async (client, blockId) => {
  try {
    const data = { blockId };
    const tasksList = await taskEntity.list(client, data);
    const tasks = [];
    for (const taskData of tasksList) {
      const { task } = await getTaskInfo(client, taskData);
      tasks.push(task);
    }
    return { tasks };
  } catch (err) {
    throw err;
  }
}
const getTask = async (client, id) => {
  try {
    const data = { id };
    const taskData = await taskEntity.get(client, data);
    const { task } = await getTaskInfo(client, taskData);
    return { task };
  } catch (err) {
    throw err;
  }
}
const createTask = async (client, dataTask, dataDocument, dataFile, dataTaskAnswers) => {
  try {
    const document = await documentEntity.create(client, dataDocument);
    const task = await taskEntity.create(client, dataTask);
    for (const answer of dataTaskAnswers ) {
      const dataAnswer = { ...answer, taskId: task.id };
      if (answer.type === 'file') {
        await taskDocumentEntity.create(client, dataAnswer);
      }
      if (answer.type === 'link') {
        await taskLinkEntity.create(client, dataAnswer);
      }
    }
    document.file = dataFile;
    task.document = document;
    task.taskAnswers = dataTaskAnswers;
    return { task };
  } catch (err) {
    throw err;
  }
}
const updateTask = async (client, dataTask, dataDocument, dataFile, dataTaskAnswers) => {
  try {
    const documentOld = await documentEntity.get(client, { id: dataDocument.id });
    await documentEntity.update(client, dataDocument);
    if (documentOld.fileId !== dataDocument.fileId) {
      const file = await fileEntity.get(client, { id: documentOld.fileId });
      if (fs.existsSync(`./${file.path}`)) {
        fs.unlinkSync(`./${file.path}`);
      }
      await fileEntity.del(client, file.id);
    }

    // taskDocuments
    const taskDocuments = dataTaskAnswers.filter(d => d.type === 'file');
    const taskDocumentsExist = await taskDocumentEntity.list(client, { taskId: dataTask.id });
    const taskDocumentsCreate = taskDocuments.filter(d => !taskDocumentsExist.find(dExist => d.id === dExist.id));
    const taskDocumentsDelete = taskDocumentsExist.filter(dExist => !taskDocuments.find(d => d.id === dExist.id));
    const promisesDocumentsCreate = taskDocumentsCreate.map((answer) => {
      const dataAnswer = { ...answer, taskId: dataTask.id };
      return taskDocumentEntity.create(client, dataAnswer);
    })
    await Promise.all(promisesDocumentsCreate);
    const promisesDocumentsDelete = taskDocumentsDelete.map((answer) => {
      return taskDocumentEntity.del(client, answer.id );
    })
    await Promise.all(promisesDocumentsDelete);

    // taskLinks
    const taskLinks = dataTaskAnswers.filter(d => d.type === 'link');
    const taskLinksExist = await taskLinkEntity.list(client, { taskId: dataTask.id });
    const taskLinksCreate = taskLinks.filter(d => !taskLinksExist.find(dExist => d.id === dExist.id));
    const taskLinksDelete = taskLinksExist.filter(dExist => !taskLinks.find(d => d.id === dExist.id));
    const promisesLinksCreate = taskLinksCreate.map((answer) => {
      const dataAnswer = { ...answer, taskId: dataTask.id };
      return taskLinkEntity.create(client, dataAnswer);
    })
    await Promise.all(promisesLinksCreate);
    const promisesLinksDelete = taskLinksDelete.map((answer) => {
      return taskLinkEntity.del(client, answer.id );
    })
    await Promise.all(promisesLinksDelete);

    const task = {
      id: dataTask.id,
      blockId: dataTask.blockId,
      documentId: dataDocument.id,
      document: { ...dataDocument, file: { ...dataFile } }
    };
    return { task };
  } catch (err) {
    throw err;
  }
}
const deleteTask = async (client, id) => {
  try {
    // get info
    const task = await taskEntity.get(client, { id });
    const taskDocuments = await taskDocumentEntity.list(client, { taskId: id });
    const taskLinks = await taskLinkEntity.list(client, { taskId: id });
    const document = await documentEntity.get(client, { id: task.documentId });
    const file = await fileEntity.get(client, { id: document.fileId });

    // file unlink
    if (fs.existsSync(`./${file.path}`)) {
      fs.unlinkSync(`./${file.path}`);
    }

    // delete
    for (const taskLink of taskLinks) await taskLinkEntity.del(client, taskLink.id)
    for (const taskDocument of taskDocuments) await taskDocumentEntity.del(client, taskDocument.id)
    await taskEntity.del(client, task.id)
    await documentEntity.del(client, document.id)
    await fileEntity.del(client, file.id)
  } catch (err) {
    throw err;
  }
}
const deleteTasks = async (client, ids) => {
  try {
    for (const id of ids) {
      await deleteTask(client, id);
    }
  } catch (err) {
    throw err;
  }
}

const getTasksUserByBlockId = async (client, userId, blockId) => {
  try {
    const data = { userId, blockId };
    const tasksList = await taskEntity.listUser(client, data);
    const tasks = [];
    for (const taskData of tasksList) {
      const { task } = await getTaskInfo(client, taskData);
      tasks.push(task);
    }
    return { tasks };
  } catch (err) {
    throw err;
  }
}
const getTaskUser = async (client, id, userId) => {
  try {
    const data = { id, userId };
    const taskData = await taskEntity.getUser(client, data);
    const { task } = await getTaskInfo(client, taskData);
    return { task };
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getTasksByBlockId,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  deleteTasks,

  getTasksUserByBlockId,
  getTaskUser
}