const Card = require('../models/card');

module.exports.getCards = async (req, res) => {
  const cards = await Card.find({})
  res.send(cards)
};

module.exports.createCard = async (req, res) => {
  try {
    const { name, link } = req.body;

    const newCard = await Card.create({ name, link, owner: req.user._id })
    res.send(newCard)
  } catch (err) {
    res.status(400).send({message: "Переданы некорректные данные при создании карточки"})
  }
};

module.exports.deleteCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndRemove(req.params.cardId)
    res.send(card)
  } catch (err) {
    res.status(404).send({message: "Запрашиваемая карточка не найдена"})
  }
};

module.exports.likeCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    )
    res.send(card)
  } catch (err) {
    res.status(404).send({message: "Запрашиваемая карточка не найдена"})
  }
};

module.exports.dislikeCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true }
    )
    res.send(card)
  } catch (err) {
    res.status(404).send({message: "Запрашиваемая карточка не найдена"})
  }
};