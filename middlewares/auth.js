const jwt = require('jsonwebtoken');
const {
  UNAUTHORIZED,
} = require('../utils/utils');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    const error = new Error('Вы не авторизованы');
    error.statusCode = UNAUTHORIZED;
    next(error);
  }
  const token = authorization.replace('Bearer ', '');

  let payload;

  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    const error = new Error('Вы не авторизованы');
    error.statusCode = UNAUTHORIZED;
    next(error);
  }

  req.user = payload;
  return next();
};
