const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const { PORT = 3000 } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.user = {
    _id: '62b2e6955d76ee60e14dc17e'
  };

  next();
});

app.use('/users', require('./routes/users'))
app.use('/cards', require('./routes/cards'))

async function main() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mestodb');
  } catch (err) {
    console.log(err.message)
  }

  app.listen(PORT, () => {
    console.log('Процесс пошел');
  });
}

main();