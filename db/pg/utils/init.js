const pool = require("./pool");
// const crypto = require("crypto");
// const cryptoPass = require("../../../utils/cryptoPass");

const init = async () => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN');
    let query;

    // users
    query = `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      firstname TEXT NOT NULL,
      lastname TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      salt TEXT NOT NULL,
      active BOOL NOT NULL,
      paid BOOL NOT NULL,
      admin BOOL NOT NULL,
      refreshToken TEXT
    )`;
    await client.query(query);

    // modules
    query = `CREATE TABLE IF NOT EXISTS modules (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      name TEXT NOT NULL,
      position INT NOT NULL
    )`;
    await client.query(query);

    // blocks
    query = `CREATE TABLE IF NOT EXISTS blocks (
      id TEXT PRIMARY KEY,
      moduleId TEXT NOT NULL,
      title TEXT NOT NULL,
      name TEXT NOT NULL,
      position INT NOT NULL,
      FOREIGN KEY(moduleId) REFERENCES modules(id)
    )`;
    await client.query(query);

    // files
    query = `CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      size INT NOT NULL,
      mimetype TEXT NOT NULL,
      path TEXT NOT NULL
    )`;
    await client.query(query);

    // documents
    query = `CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      fileId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      FOREIGN KEY(fileId) REFERENCES files(id)
    )`;
    await client.query(query);

    // materials
    query = `CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      blockId TEXT NOT NULL,
      documentId TEXT NOT NULL,
      FOREIGN KEY(blockId) REFERENCES blocks(id),
      FOREIGN KEY(documentId) REFERENCES documents(id)
    )`;
    await client.query(query);

    // questions
    query = `CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      blockId TEXT NOT NULL,
      title TEXT NOT NULL,
      position INT NOT NULL,
      FOREIGN KEY(blockId) REFERENCES blocks(id)
    )`;
    await client.query(query);

    // questionOptions
    query = `CREATE TABLE IF NOT EXISTS questionOptions (
      id TEXT PRIMARY KEY,
      questionId TEXT NOT NULL,
      title TEXT NOT NULL,
      correct BOOL NOT NULL,
      FOREIGN KEY(questionId) REFERENCES questions(id)
    )`;
    await client.query(query);

    // userModules
    query = `CREATE TABLE IF NOT EXISTS userModules (
      id TEXT PRIMARY KEY,
      moduleId TEXT NOT NULL,
      userId TEXT NOT NULL,
      enable BOOL NOT NULL,
      complete BOOL NOT NULL,
      FOREIGN KEY(moduleId) REFERENCES modules(id),
      FOREIGN KEY(userId) REFERENCES users(id)
    )`;
    await client.query(query);

    // userBlocks
    query = `CREATE TABLE IF NOT EXISTS userBlocks (
      id TEXT PRIMARY KEY,
      blockId TEXT NOT NULL,
      userId TEXT NOT NULL,
      enable BOOL NOT NULL,
      complete BOOL NOT NULL,
      completeMaterials BOOL NOT NULL,
      completeQuestions BOOL NOT NULL,
      completeTasks BOOL NOT NULL,
      FOREIGN KEY(blockId) REFERENCES blocks(id),
      FOREIGN KEY(userId) REFERENCES users(id)
    )`;
    await client.query(query);

    // userMaterials
    query = `CREATE TABLE IF NOT EXISTS userMaterials (
      id TEXT PRIMARY KEY,
      materialId TEXT NOT NULL,
      userId TEXT NOT NULL,
      complete BOOL NOT NULL,
      FOREIGN KEY(materialId) REFERENCES materials(id),
      FOREIGN KEY(userId) REFERENCES users(id)
    )`;
    await client.query(query);

    // userQuestions
    query = `CREATE TABLE IF NOT EXISTS userQuestions (
      id TEXT PRIMARY KEY,
      questionId TEXT NOT NULL,
      userId TEXT NOT NULL,
      complete BOOL NULL,      
      FOREIGN KEY(questionId) REFERENCES questions(id),
      FOREIGN KEY(userId) REFERENCES users(id)
    )`;
    await client.query(query);

    // userQuestionAnswers
    query = `CREATE TABLE IF NOT EXISTS userQuestionAnswers (
      id TEXT PRIMARY KEY,
      questionId TEXT NOT NULL,
      optionId TEXT NOT NULL,
      userId TEXT NOT NULL,
      FOREIGN KEY(questionId) REFERENCES questions(id),
      FOREIGN KEY(optionId) REFERENCES questionOptions(id),
      FOREIGN KEY(userId) REFERENCES users(id)
    )`;
    await client.query(query);

    // tasks
    query = `CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      blockId TEXT NOT NULL,
      taskDocumentId TEXT,
      taskLinkId TEXT,
      type TEXT NOT NULL,
      FOREIGN KEY(blockId) REFERENCES blocks(id),
      FOREIGN KEY(taskDocumentId) REFERENCES taskDocuments(id),
      FOREIGN KEY(taskLinkId) REFERENCES taskLinks(id)
    )`;
    await client.query(query);

    // taskDocuments
    query = `CREATE TABLE IF NOT EXISTS taskDocuments (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL
    )`;
    await client.query(query);

    // taskLinks
    query = `CREATE TABLE IF NOT EXISTS taskLinks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL
    )`;
    await client.query(query);

    // create an initial user (username: qwe, password: qwe)
    // const { v4: guid } = require("uuid");
    // const firstname = 'qwe';
    // const lastname = 'qwe';
    // const username = 'qwe@qwe.qwe';
    // const salt = crypto.randomBytes(16).toString('hex');
    // const password = cryptoPass(salt, 'qwe');
    // query = `INSERT INTO users (id, firstname, lastname, username, password, salt, active, paid, admin) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`;
    // const params = [guid(), firstname, lastname, username, password, salt, true, true, true];
    // await client.query(query, params);

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

module.exports = init