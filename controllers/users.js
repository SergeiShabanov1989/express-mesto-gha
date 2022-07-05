const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { OK, CREATED } = require('../utils/utils');
const NotFoundError = require('../errors/not-found-err');
const BadRequest = require('../errors/bad-request-err');
const ConflictError = require('../errors/conflict-err');
const UnauthorizedError = require('../errors/unauthorized-err');

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
      return next(new NotFoundError('Запрашиваемый пользователь не найден'));
    }
    if (err.name === 'CastError') {
      return next(new BadRequest('Некорректно передан id'));
    }
    next(err);
  }
  return null;
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
        res.status(CREATED).send({
          name: user.name,
          about: user.about,
          avatar: user.avatar,
          email: user.email,
        });
      });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(new BadRequest('Переданы некорректные данные при создании пользователя'));
    }
    if (err.code === 11000) {
      return next(new ConflictError('Такой email уже зарегистрирован'));
    }
    next(err);
  }
  return null;
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
      return next(new BadRequest('Переданы некорректные данные при обновлении профиля'));
    }
    if (err.message === 'Not Found') {
      return next(new NotFoundError('Запрашиваемый пользователь не найден'));
    }
    next(err);
  }
  return null;
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
      return next(new BadRequest('Переданы некорректные данные при обновлении аватара'));
    }
    if (err.message === 'Not Found') {
      return next(new NotFoundError('Запрашиваемый пользователь не найден'));
    }
    next(err);
  }
  return null;
};

module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    await User.findOne({ email }).select('+password')
      .then((user) => {
        if (!user) {
          return next(new UnauthorizedError('Неправильный email или пароль'));
        }
        return Promise.all([
          user,
          bcrypt.compare(password, user.password),
        ]);
      })
      .then(([user, matched]) => {
        if (!matched) {
          return next(new UnauthorizedError('Неправильный email или пароль'));
        }
        return Promise.all([
          user,
          jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' }),
        ]);
      })
      .then(([user, token]) => {
        res.status(OK).send(
          {
            user,
            token,
          },
        );
      });
  } catch (err) {
    if (err.statusCode === 401) {
      return next(new UnauthorizedError('Вы не авторизованы'));
    }
    next(err);
  }
  return null;
};

module.exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(OK).send(user);
  } catch (err) {
    next(err);
  }
};
