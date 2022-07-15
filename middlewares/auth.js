const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-err');

// const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Вы не авторизованы'));
  }
  const token = authorization.replace('Bearer ', '');

  let payload;

  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    return next(new UnauthorizedError('Вы не авторизованы'));
  }

  req.user = payload;
  return next();
};
