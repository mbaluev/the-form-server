const connect = require("./connect");

const db = connect();

db.beginTransaction(function(err, transaction) {
  // users
  transaction.run("CREATE TABLE IF NOT EXISTS users ( \
    id TEXT PRIMARY KEY, \
    firstname TEXT NOT NULL, \
    lastname TEXT NOT NULL, \
    username TEXT UNIQUE NOT NULL, \
    password BLOB NOT NULL, \
    salt BLOB NOT NULL, \
    active INTEGER NOT NULL, \
    paid INTEGER NOT NULL, \
    admin INTEGER NOT NULL, \
    refreshToken TEXT \
  )");

  // modules
  transaction.run("CREATE TABLE IF NOT EXISTS modules ( \
    id TEXT PRIMARY KEY, \
    title TEXT NOT NULL, \
    name TEXT NOT NULL, \
    position NUMBER NOT NULL \
  )");

  // blocks
  transaction.run("CREATE TABLE IF NOT EXISTS blocks ( \
    id TEXT PRIMARY KEY, \
    moduleId TEXT NOT NULL, \
    title TEXT NOT NULL, \
    name TEXT NOT NULL, \
    FOREIGN KEY(moduleId) REFERENCES modules(id)\
  )");

  // files
  transaction.run("CREATE TABLE IF NOT EXISTS files ( \
    id TEXT PRIMARY KEY, \
    name TEXT NOT NULL, \
    size INTEGER NOT NULL, \
    mimetype TEXT NOT NULL, \
    path TEXT NOT NULL \
  )");

  // documents
  transaction.run("CREATE TABLE IF NOT EXISTS documents ( \
    id TEXT PRIMARY KEY, \
    fileId TEXT NOT NULL, \
    name TEXT NOT NULL, \
    description TEXT NOT NULL, \
    FOREIGN KEY(fileId) REFERENCES files(id)\
  )");

  // materials
  transaction.run("CREATE TABLE IF NOT EXISTS materials ( \
    id TEXT PRIMARY KEY, \
    blockId TEXT NOT NULL, \
    documentId TEXT NOT NULL, \
    FOREIGN KEY(blockId) REFERENCES blocks(id),\
    FOREIGN KEY(documentId) REFERENCES documents(id)\
  )");

  // tasks
  transaction.run("CREATE TABLE IF NOT EXISTS tasks ( \
    id TEXT PRIMARY KEY, \
    blockId TEXT NOT NULL, \
    documentId TEXT NOT NULL, \
    FOREIGN KEY(blockId) REFERENCES blocks(id),\
    FOREIGN KEY(documentId) REFERENCES documents(id)\
  )");

  // taskDocuments
  transaction.run("CREATE TABLE IF NOT EXISTS taskDocuments ( \
    id TEXT PRIMARY KEY, \
    taskId TEXT NOT NULL, \
    title TEXT NOT NULL, \
    FOREIGN KEY(taskId) REFERENCES tasks(id)\
  )");

  // taskLinks
  transaction.run("CREATE TABLE IF NOT EXISTS taskLinks ( \
    id TEXT PRIMARY KEY, \
    taskId TEXT NOT NULL, \
    title TEXT NOT NULL, \
    FOREIGN KEY(taskId) REFERENCES tasks(id)\
  )");

  // questions
  transaction.run("CREATE TABLE IF NOT EXISTS questions ( \
    id TEXT PRIMARY KEY, \
    blockId TEXT NOT NULL, \
    title TEXT NOT NULL, \
    FOREIGN KEY(blockId) REFERENCES blocks(id)\
  )");

  // questionAnswers
  transaction.run("CREATE TABLE IF NOT EXISTS questionAnswers ( \
    id TEXT PRIMARY KEY, \
    questionId TEXT NOT NULL, \
    title TEXT NOT NULL, \
    FOREIGN KEY(questionId) REFERENCES questions(id)\
  )");

  // questionAnswersCorrect
  transaction.run("CREATE TABLE IF NOT EXISTS questionAnswersCorrect ( \
    id TEXT PRIMARY KEY, \
    questionId TEXT NOT NULL, \
    questionAnswerId TEXT NOT NULL, \
    FOREIGN KEY(questionId) REFERENCES questions(id),\
    FOREIGN KEY(questionAnswerId) REFERENCES questionAnswers(id)\
  )");

  // userModules
  transaction.run("CREATE TABLE IF NOT EXISTS userModules ( \
    id TEXT PRIMARY KEY, \
    moduleId TEXT NOT NULL, \
    userId TEXT NOT NULL, \
    enable NUMBER NOT NULL, \
    complete NUMBER NOT NULL, \
    FOREIGN KEY(moduleId) REFERENCES modules(id),\
    FOREIGN KEY(userId) REFERENCES users(id)\
  )");

  // create an initial user (username: alice, password: letmein)
  // const username = 'alice';
  // const salt = crypto.randomBytes(16).toString('hex');
  // const password = cryptoPass(salt, 'letmein');
  // transaction.run('INSERT OR IGNORE INTO users (id, username, password, salt, active, paid, admin) VALUES (?,?,?,?,?,?,?)',
  //   [guid(), username, password, salt, 1, 0, 0]
  // );

  transaction.commit((err) => {
    if (err) return console.log(err);
  });
});

module.exports = db;