const Card = require('../models/card');
const {
  BAD_REQUEST,
  NOT_FOUND,
  ERROR,
  OK,
  CREATED,
  FORBIDDEN,
} = require('../utils/utils');

// module.exports.getCards = async (req, res) => {
//   try {
//     const cards = await Card.find({});
//     res.status(OK).send(cards);
//   } catch (err) {
//     res.status(ERROR).send({ message: 'Ошибка по умолчанию' });
//   }
// };

module.exports.getCards = async (req, res) => {
  const cards = await Card.find({});
  res.status(OK).send(cards);
};

module.exports.createCard = async (req, res, next) => {
  try {
    const { name, link } = req.body;

    const newCard = await Card.create({ name, link, owner: req.user._id });
    res.status(CREATED).send(newCard);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const error = new Error('Переданы некорректные данные при создании карточки');
      error.statusCode = BAD_REQUEST;
      next(error);
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
            .catch((err) => res.status(404).send({ error: err.message }));
        }
      });
    return res.status(FORBIDDEN).send({ error: 'Нет доступа' });
  } catch (err) {
    if (err.message === 'Not Found') {
      const error = new Error('Запрашиваемая карточка не найдена');
      error.statusCode = NOT_FOUND;
      next(error);
    }
    if (err.name === 'CastError') {
      const error = new Error('Некорректно передан id');
      error.statusCode = BAD_REQUEST;
      next(error);
    }
  }
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
      const error = new Error('Запрашиваемая карточка не найдена');
      error.statusCode = NOT_FOUND;
      next(error);
    }
    if (err.name === 'CastError') {
      const error = new Error('Некорректно передан id');
      error.statusCode = BAD_REQUEST;
      next(error);
    }
  }
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
      const error = new Error('Запрашиваемая карточка не найдена');
      error.statusCode = NOT_FOUND;
      next(error);
    }
    if (err.name === 'CastError') {
      const error = new Error('Некорректно передан id');
      error.statusCode = BAD_REQUEST;
      next(error);
    }
  }
};
