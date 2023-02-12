const session = require("express-session")
const SQLiteStore = require("connect-sqlite3")(session);

const store = new SQLiteStore({ db: 'the-form', dir: './db' });

module.exports = store;