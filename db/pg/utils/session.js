const session = require("express-session");
const pgSession = require('connect-pg-simple')(session);
const pool = require('./pool');

const store = new pgSession({ pool, tableName : 'sessions' });

module.exports = store;
