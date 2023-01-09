const connect = require("./connect");

const db = connect();

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users ( \
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

  db.run("CREATE TABLE IF NOT EXISTS modules ( \
    id TEXT PRIMARY KEY, \
    title TEXT NOT NULL, \
    name TEXT NOT NULL \
  )");

  db.run("CREATE TABLE IF NOT EXISTS blocks ( \
    id TEXT PRIMARY KEY, \
    moduleId TEXT NOT NULL, \
    title TEXT NOT NULL, \
    name TEXT NOT NULL, \
    FOREIGN KEY(moduleId) REFERENCES modules(id)\
  )");

  db.run("CREATE TABLE IF NOT EXISTS files ( \
    id TEXT PRIMARY KEY, \
    name TEXT NOT NULL, \
    size INTEGER NOT NULL, \
    mimetype TEXT NOT NULL, \
    path TEXT NOT NULL \
  )");

  // create an initial user (username: alice, password: letmein)
  // const username = 'alice';
  // const salt = crypto.randomBytes(16).toString('hex');
  // const password = cryptoPass(salt, 'letmein');
  // db.run('INSERT OR IGNORE INTO users (id, username, password, salt, active, paid, admin) VALUES (?,?,?,?,?,?,?)',
  //   [guid(), username, password, salt, 1, 0, 0]
  // );
});

module.exports = db;