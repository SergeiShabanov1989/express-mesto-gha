const Card = require('../models/card');
const { OK, CREATED } = require('../utils/utils');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const ForbiddenError = require('../errors/forbidden-err');

module.exports.getCards = async (req, res, next) => {
  try {
    const cards = await Card.find({});
    res.status(OK).send(cards);
  } catch (err) {
    next(err);
  }
};

module.exports.createCard = async (req, res, next) => {
  try {
    const { name, link } = req.body;

    const newCard = await Card.create({ name, link, owner: req.user._id });
    res.status(CREATED).send(newCard);
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new BadRequestError('Переданы некорректные данные при создании карточки'));
    }
  }
};

module.exports.deleteCard = async (req, res, next) => {
  try {
    await Card.findById(req.params.cardId)
      .orFail(() => new Error('Not Found'))
      .then((card) => {
        if (req.user._id === card.owner.toString()) {
          return Card.findByIdAndRemove(card._id)
            .orFail(() => new Error('Что-то пошло не так'))
            .then((deletedCard) => res.status(OK).send(deletedCard))
            .catch(() => next(new BadRequestError('Некорректно передан id')));
        }
        return null;
      });
    return next(new ForbiddenError('Нет доступа'));
  } catch (err) {
    if (err.message === 'Not Found') {
      return next(new NotFoundError('Запрашиваемая карточка не найдена'));
    }
    if (err.name === 'CastError') {
      return next(new BadRequestError('Некорректно передан id'));
    }
  }
  return null;
};

module.exports.likeCard = async (req, res, next) => {
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
      return next(new NotFoundError('Запрашиваемая карточка не найдена'));
    }
    if (err.name === 'CastError') {
      return next(new BadRequestError('Некорректно передан id'));
    }
    next(err);
  }
  return null;
};

module.exports.dislikeCard = async (req, res, next) => {
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
      return next(new NotFoundError('Запрашиваемая карточка не найдена'));
    }
    if (err.name === 'CastError') {
      return next(new BadRequestError('Некорректно передан id'));
    }
    next(err);
  }
  return null;
};
