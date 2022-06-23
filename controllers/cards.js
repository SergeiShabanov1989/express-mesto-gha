const Card = require('../models/card');

module.exports.getCards = async (req, res) => {
  const cards = await Card.find({});
  res.send(cards);
};

module.exports.createCard = async (req, res) => {
  try {
    const { name, link } = req.body;

    const newCard = await Card.create({ name, link, owner: req.user._id });
    res.status(200).send(newCard);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).send({ message: "Переданы некорректные данные при создании карточки" });
      return;
    }
    res.status(500).send({ message: "Ошибка по умолчанию" });
  }
};

module.exports.deleteCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndRemove(req.params.cardId)
      .orFail(() => new Error('Not Found'));
    res.status(200).send(card);
  } catch (err) {
    if (err.message === 'Not Found') {
      res.status(404).send({ message: "Запрашиваемая карточка не найдена" });
      return;
    }
    if (err.name === 'CastError') {
      res.status(400).send({ message: "Некорректно передан id" });
      return;
    }
    res.status(500).send({ message: "Ошибка по умолчанию" });
  }
};

module.exports.likeCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    )
      .orFail(() => new Error('Not Found'));
    res.status(200).send(card);
  } catch (err) {
    if (err.message === 'Not Found') {
      res.status(404).send({ message: "Запрашиваемая карточка не найдена" });
      return;
    }
    if (err.name === 'CastError') {
      res.status(400).send({ message: "Некорректно передан id" });
      return;
    }
    res.status(500).send({ message: "Ошибка по умолчанию" });
  }
};

module.exports.dislikeCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true }
    )
      .orFail(() => new Error('Not Found'));
    res.send(card);
  } catch (err) {
    if (err.message === 'Not Found') {
      res.status(404).send({ message: "Запрашиваемая карточка не найдена" });
      return;
    }
    if (err.name === 'CastError') {
      res.status(400).send({ message: "Некорректно передан id" });
      return;
    }
    res.status(500).send({ message: "Ошибка по умолчанию" });
  }
};