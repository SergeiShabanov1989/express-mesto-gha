const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const {
  BAD_REQUEST,
  NOT_FOUND,
  ERROR,
  OK,
  CREATED,
  CONFLICT,
  UNAUTHORIZED,
} = require('../utils/utils');

module.exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(OK).send(users);
  } catch (err) {
    next(err);
  }
};

module.exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
      .orFail(() => new Error('Not Found'));
    res.status(OK).send(user);
  } catch (err) {
    if (err.message === 'Not Found') {
      const error = new Error('Запрашиваемый пользователь не найден');
      error.statusCode = NOT_FOUND;
      next(error);
    }
    if (err.name === 'CastError') {
      const error = new Error('Некорректно передан id');
      error.statusCode = BAD_REQUEST;
      next(error);
    }
  }
};

module.exports.createUser = async (req, res, next) => {
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
      const error = new Error('Переданы некорректные данные при создании пользователя');
      error.statusCode = BAD_REQUEST;
      next(error);
    }
    if (err.code === 11000) {
      const error = new Error('Переданы некорректные данные при создании пользователя');
      error.statusCode = CONFLICT;
      next(error);
    }
  }
};

module.exports.updateUserInfo = async (req, res, next) => {
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
      const error = new Error('Переданы некорректные данные при обновлении профиля');
      error.statusCode = BAD_REQUEST;
      next(error);
    }
    if (err.message === 'Not Found') {
      const error = new Error('Запрашиваемый пользователь не найден');
      error.statusCode = NOT_FOUND;
      next(error);
    }
  }
};

module.exports.updateUserAvatar = async (req, res, next) => {
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
      const error = new Error('Переданы некорректные данные при обновлении аватара');
      error.statusCode = BAD_REQUEST;
      next(error);
    }
    if (err.message === 'Not Found') {
      const error = new Error('Запрашиваемый пользователь не найден');
      error.statusCode = NOT_FOUND;
      next(error);
    }
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    await User.findOne({ email }).select('+password')
      .then((user) => {
        if (!user) {
          const error = new Error('Неправильный email или пароль');
          error.statusCode = 401;
          next(error);
        }
        return Promise.all([
          user,
          bcrypt.compare(password, user.password),
        ]);
      })
      .then(([user, matched]) => {
        if (!matched) {
          const error = new Error('Неправильный email или пароль');
          error.statusCode = 401;
          next(error);
        }
        return jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      })
      .then((token) => {
        res.send(token);
      });
  } catch (err) {
    if (err.statusCode === 401) {
      res.status(401).send({ message: err.message });
      const error = new Error('Вы не авторизованы');
      error.statusCode = 401;
      next(error);
    }
  }
};

module.exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(OK).send(user);
  } catch (err) {
    next(err);
  }
};
