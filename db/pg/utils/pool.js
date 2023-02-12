const Pool = require("pg").Pool;
const options = require("./options");

const pool = new Pool(options);

module.exports = pool