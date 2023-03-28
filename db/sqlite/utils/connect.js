const sqlite3 = require('sqlite3').verbose();
const TransactionDatabase = require("sqlite3-transactions").TransactionDatabase;

sqlite3.Database.prototype.runAsync = function (sql, ...params) {
  return new Promise((resolve, reject) => {
    this.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
};

sqlite3.Database.prototype.getAsync = function (sql, ...params) {
  return new Promise((resolve, reject) => {
    this.get(sql, params, function (err, row) {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

sqlite3.Database.prototype.allAsync = function (sql, ...params) {
  return new Promise((resolve, reject) => {
    this.all(sql, params, function (err, rows) {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

sqlite3.Database.prototype.runBatchAsync = function (statements) {
  const db = this;
  const results = [];
  const batch = ['BEGIN', ...statements, 'COMMIT'];
  return batch.reduce((chain, statement) => chain.then(result => {
    results.push(result);
    return db.runAsync(...[].concat(statement));
  }), Promise.resolve())
    .catch(err => db.runAsync('ROLLBACK').then(() => Promise.reject(err +
      ' in statement #' + results.length)))
    .then(() => results.slice(2));
};

module.exports = () => {
  return new TransactionDatabase(
    new sqlite3.Database('./db/sqlite/the-form', sqlite3.OPEN_READWRITE, (err) => {
      if (err) console.error(err.message);
      console.log('Connected to the database');
    })
  );
}
