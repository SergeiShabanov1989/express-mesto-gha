require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');
const cors = require('cors');
const { ERROR } = require('./utils/utils');
const { REGEX_URL } = require('./utils/utils');
const NotFoundError = require('./errors/not-found-err');

const { login, createUser } = require('./controllers/users');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const auth = require('./middlewares/auth');

const { PORT = 3001 } = process.env;
const app = express();

const options = {
  origin: [
    'http://localhost:3000',
    'https://ваш-домен',
    'https://your-name-of.github.io',
  ]
};

app.use('*', cors(options));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(requestLogger);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email().min(1),
    password: Joi.string().required().min(1),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: REGEX_URL,
    email: Joi.string().required().email().min(1),
    password: Joi.string().required().min(1),
  }),
}), createUser);

app.use(auth);

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.use((req, res, next) => {
  next(new NotFoundError('Запрашиваемая страница не найдена'));
});

async function main() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mestodb');
  } catch (err) {
    throw new Error(err);
  }
  app.listen(PORT);
}

main();

app.use(errorLogger);

app.use(errors());
/* eslint-disable */
app.use((err, req, res, next) => {
  if (err.statusCode) {
    return res.status(err.statusCode).send({ message: err.message });
  }

  return res.status(ERROR).send({ message: 'Ошибка по умолчанию' });
});
/* eslint-enable */
