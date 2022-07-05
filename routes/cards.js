const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');
const { REGEX_ID, REGEX_URL } = require('../utils/utils');

router.get('/', getCards);
router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: REGEX_URL.required(),
  }),
}), createCard);
router.delete('/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: REGEX_ID,
  }),
  headers: Joi.object().keys({
    authoriation: Joi.string(),
  }).unknown(true),
}), deleteCard);
router.put('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: REGEX_ID,
  }),
  headers: Joi.object().keys({
    authoriation: Joi.string(),
  }).unknown(true),
}), likeCard);
router.delete('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: REGEX_ID,
  }),
  headers: Joi.object().keys({
    authoriation: Joi.string(),
  }).unknown(true),
}), dislikeCard);

module.exports = router;
