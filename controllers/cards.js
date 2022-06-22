const Card = require('../models/card');

module.exports.getCards = async (req, res) => {
  const cards = await Card.find({})
  res.send(cards)
};

module.exports.createCard = async (req, res) => {
  const { name, link } = req.body;

  const newCard = await Card.create({ name, link, owner: req.user._id })
  res.send(newCard)
};

module.exports.deleteCard = async (req, res) => {
  const card = await Card.findByIdAndRemove(req.params.cardId)
  res.send(card)
};

module.exports.likeCard = async (req, res) => {
  const card = await Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
  res.send(card)
};

module.exports.dislikeCard = async (req, res) => {
  const card = await Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
  res.send(card)
};