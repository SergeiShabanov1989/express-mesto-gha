const User = require('../models/user');

module.exports.getUsers = async (req, res) => {
  const users = await User.find({})
  res.send(users)
};

module.exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id)
  res.send(user)
};

module.exports.createUser = async (req, res) => {
  const { name, about, avatar } = req.body;

  const newUser = await User.create({ name, about, avatar })
  res.send(newUser)
};