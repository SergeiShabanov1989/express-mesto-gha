const User = require('../models/user');

module.exports.getUsers = async (req, res) => {
  const users = await User.find({})
  res.send({ data: users })

  .catch(err => res.status(500).send({ message: err.message }));
};

module.exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id)
    res.send({ data: user })

    .catch(err => res.status(500).send({ message: err.message }));
};

module.exports.createUser = async (req, res) => {
  const { name, about } = req.body;

  const newUser = await User.create({ name, about })
    res.send({ data: newUser })

    .catch(err => res.status(500).send({ message: err.message }));
};