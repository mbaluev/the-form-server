module.exports = (db) => {
  db.close((err) => {
    if (err) console.error(err.message);
    console.log('Close the database connection');
  })
}

