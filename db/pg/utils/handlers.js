const objectPath = require('object-path');

class CodeError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const throwError = (code, message) => {
  throw new CodeError(code, message);
}

const validateRequest = (req, ...arr) => {
  const errors = []
  arr.forEach((field) => {
    if (!objectPath.get(req.body, field)) {
      errors.push(`No ${field} specified`);
    }
  })
  if (errors.length) throwError(400, errors.join(", "));
}

const errorHandler = async (client, res, err) => {
  await client.query('ROLLBACK');
  console.log('error:', err.message);
  res.status(500).send({
    success: false,
    message: err.message,
    stack: err.stack
  });
}

const finallyHandler = (client) => {
  client.release();
}

module.exports = {
  throwError,
  validateRequest,
  errorHandler,
  finallyHandler
}