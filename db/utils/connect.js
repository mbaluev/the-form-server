const sqlite3 = require('sqlite3').verbose();

module.exports = () => {
  return new sqlite3.Database('./db/the-form', sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.error(err.message);
    console.log('Connected to the database');
  });
}