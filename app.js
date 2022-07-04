const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { NOT_FOUND, ERROR } = require('./utils/utils');

const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');

const { PORT = 3000 } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/signin', login);
app.post('/signup', createUser);

app.use(auth);

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.use((req, res) => {
  res.status(NOT_FOUND).send({ message: 'Запрашиваемая страница не найдена' });
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

app.use((err, req, res, next) => {
  if (err.statusCode) {
    return res.status(err.statusCode).send({ message: err.message });
  }

  console.error(err.stack);
  res.status(ERROR).send({ message: 'Ошибка по умолчанию' });
});
