const User = require('../models/user');

module.exports.getUsers = async (req, res) => {
  const users = await User.find({})
  res.send(users)
};

module.exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    res.send(user)
  } catch (err) {
    res.status(404).send({message: "Запрашиваемый пользователь не найден"})
  }
};

module.exports.createUser = async (req, res) => {
  try {
    const { name, about, avatar } = req.body;

    const newUser = await User.create({ name, about, avatar })
    res.send(newUser)
  } catch (err) {
    res.status(400).send({message: "Переданы некорректные данные при создании пользователя"})
  }
};

module.exports.updateUserInfo = async (req, res) => {
  try {
    const { name, about } = req.body;

    const user = await User.findByIdAndUpdate(req.user._id, { name, about }, { new: true })
    res.send(user)
  } catch (err) {
    res.status(400).send({message: "Переданы некорректные данные при обновлении профиля"})
  }
};

module.exports.updateUserAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;

    const user = await User.findByIdAndUpdate(req.user._id, { avatar }, { new: true })
    res.send(user)
  } catch (err) {
    res.status(400).send({message: "Переданы некорректные данные при обновлении аватара."})
  }
};