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
    const { name, about, avatar } = req.body;

    const newUser = await User.create({ name, about, avatar });
    res.status(CREATED).send(newUser);
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
