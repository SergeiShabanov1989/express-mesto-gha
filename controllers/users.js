const User = require('../models/user');

module.exports.getUsers = async (req, res) => {
  const users = await User.find({})
  res.send(users)
};

module.exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.userId)
  res.send(user)
};

module.exports.createUser = async (req, res) => {
  const { name, about, avatar } = req.body;

  const newUser = await User.create({ name, about, avatar })
  res.send(newUser)
};

module.exports.updateUserInfo = async (req, res) => {
  const { name, about } = req.body;

  const user = await User.findByIdAndUpdate(req.user._id, { name, about }, { new: true })
  res.send(user)
};

module.exports.updateUserAvatar = async (req, res) => {
  const { avatar } = req.body;

  const user = await User.findByIdAndUpdate(req.user._id, { avatar }, { new: true })
  res.send(user)
};