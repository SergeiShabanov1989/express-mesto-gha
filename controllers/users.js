const User = require('../models/user');

module.exports.getUsers = async (req, res) => {
  const users = await User.find({})
  res.status(200).send(users)
};

module.exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .orFail(() => new Error('Not Found'))
    res.status(200).send(user)
  } catch (err) {
    if (err.message === 'Not Found') {
      res.status(404).send({message: "Запрашиваемый пользователь не найден"})
      return
    }
    if (err.name === 'CastError') {
      res.status(400).send({message: "Некорректно передан id"})
      return
    }
    res.status(500).send({message: "Ошибка по умолчанию"})
  }
};

module.exports.createUser = async (req, res) => {
  try {
    const { name, about, avatar } = req.body;

    const newUser = await User.create({ name, about, avatar })
    res.status(200).send(newUser)
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).send({message: "Переданы некорректные данные при создании пользователя"})
      return
    }
    res.status(500).send({message: "Ошибка по умолчанию"})
  }
};

module.exports.updateUserInfo = async (req, res) => {
  try {
    const { name, about } = req.body;

    const user = await User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    res.status(200).send(user)
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).send({message: "Переданы некорректные данные при обновлении профиля"})
      return
    }
    res.status(500).send({message: "Ошибка по умолчанию"})
  }
};

module.exports.updateUserAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;

    const user = await User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    res.status(200).send(user)
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).send({message: "Переданы некорректные данные при обновлении аватара."})
      return
    }
    res.status(500).send({message: "Ошибка по умолчанию"})
  }
};