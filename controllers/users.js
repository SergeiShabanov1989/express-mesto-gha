const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const {
  BAD_REQUEST,
  NOT_FOUND,
  ERROR,
  OK,
  CREATED,
} = require('../utils/utils');

module.exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(OK).send(users);
  } catch (err) {
    res.status(ERROR).send({ message: 'Ошибка по умолчанию' });
  }
};

module.exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .orFail(() => new Error('Not Found'));
    res.status(OK).send(user);
  } catch (err) {
    if (err.message === 'Not Found') {
      res.status(NOT_FOUND).send({ message: 'Запрашиваемый пользователь не найден' });
      return;
    }
    if (err.name === 'CastError') {
      res.status(BAD_REQUEST).send({ message: 'Некорректно передан id' });
      return;
    }
    res.status(ERROR).send({ message: 'Ошибка по умолчанию' });
  }
};

module.exports.createUser = async (req, res) => {
  try {
    await bcrypt.hash(req.body.password, 10)
      .then((hash) => User.create({
        name: req.body.name,
        about: req.body.about,
        avatar: req.body.avatar,
        email: req.body.email,
        password: hash,
      }))
      .then((user) => {
        res.status(CREATED).send(user);
      });
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя' });
      return;
    }
    res.status(ERROR).send({ message: 'Ошибка по умолчанию' });
  }
};

module.exports.updateUserInfo = async (req, res) => {
  try {
    const { name, about } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true },
    ).orFail(() => new Error('Not Found'));
    res.status(OK).send(user);
  } catch (err) {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении профиля' });
      return;
    }
    if (err.message === 'Not Found') {
      res.status(NOT_FOUND).send({ message: 'Запрашиваемый пользователь не найден' });
      return;
    }
    res.status(ERROR).send({ message: 'Ошибка по умолчанию' });
  }
};

module.exports.updateUserAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
    ).orFail(() => new Error('Not Found'));
    res.status(OK).send(user);
  } catch (err) {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении аватара' });
      return;
    }
    if (err.message === 'Not Found') {
      res.status(NOT_FOUND).send({ message: 'Запрашиваемый пользователь не найден' });
      return;
    }
    res.status(ERROR).send({ message: 'Ошибка по умолчанию' });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .then((user) => {
        if (!user) {
          return Promise.reject(new Error('Неправильный email или пароль'));
        }
        return Promise.all([
          user,
          bcrypt.compare(password, user.password)
        ]);
      })
      .then((matched) => {
        if (!matched) {
          return Promise.reject(new Error('Неправильный email или пароль'));
        }
        return jwt.sign({ _id: user._id }, 'some-secret-key')
      });
  } catch (err) {
    if (err.message === 'Not Found') {
      res.status(NOT_FOUND).send({ message: 'Запрашиваемый пользователь не найден' });
      return;
    }
    res.status(ERROR).send({ message: 'Ошибка по умолчанию' });
  }
};
