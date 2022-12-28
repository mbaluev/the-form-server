const crypto = require('crypto');

module.exports = (salt, password) => {
  return crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha256').toString('hex');
}