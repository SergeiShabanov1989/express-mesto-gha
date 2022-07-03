const Card = require('../models/card');
const {
  BAD_REQUEST,
  NOT_FOUND,
  ERROR,
  OK,
  CREATED,
  FORBIDDEN,
} = require('../utils/utils');

module.exports.getCards = async (req, res) => {
  try {
    const cards = await Card.find({});
    res.status(OK).send(cards);
  } catch (err) {
    res.status(ERROR).send({ message: 'Ошибка по умолчанию' });
  }
};

module.exports.createCard = async (req, res) => {
  try {
    const { name, link } = req.body;

    const newCard = await Card.create({ name, link, owner: req.user._id });
    res.status(CREATED).send(newCard);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании карточки' });
      return;
    }
    res.status(ERROR).send({ message: 'Ошибка по умолчанию' });
  }
};

module.exports.deleteCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId)
      .orFail(() => new Error('Not Found'));
    if (req.user._id === card.owner.toString()) {
      return Card.findByIdAndRemove(card._id)
        .orFail(() => new Error('Bad Request'))
        .then((deletedCard) => res.status(OK).send(deletedCard));
    }
    return res.status(FORBIDDEN).send({ error: 'Нет доступа' });
  } catch (err) {
    if (err.message === 'Not Found') {
      res.status(NOT_FOUND).send({ message: 'Запрашиваемая карточка не найдена' });
      return;
    }
    if (err.name === 'CastError') {
      res.status(BAD_REQUEST).send({ message: 'Некорректно передан id' });
      return;
    }
    res.status(ERROR).send({ message: 'Ошибка по умолчанию' });
  }
};

module.exports.likeCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    )
      .orFail(() => new Error('Not Found'));
    res.status(OK).send(card);
  } catch (err) {
    if (err.message === 'Not Found') {
      res.status(NOT_FOUND).send({ message: 'Запрашиваемая карточка не найдена' });
      return;
    }
    if (err.name === 'CastError') {
      res.status(BAD_REQUEST).send({ message: 'Некорректно передан id' });
      return;
    }
    res.status(ERROR).send({ message: 'Ошибка по умолчанию' });
  }
};

module.exports.dislikeCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    )
      .orFail(() => new Error('Not Found'));
    res.status(OK).send(card);
  } catch (err) {
    if (err.message === 'Not Found') {
      res.status(NOT_FOUND).send({ message: 'Запрашиваемая карточка не найдена' });
      return;
    }
    if (err.name === 'CastError') {
      res.status(BAD_REQUEST).send({ message: 'Некорректно передан id' });
      return;
    }
    res.status(ERROR).send({ message: 'Ошибка по умолчанию' });
  }
};
