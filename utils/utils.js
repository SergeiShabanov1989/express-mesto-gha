const { Joi } = require('celebrate');

module.exports.OK = 200;
module.exports.CREATED = 201;
module.exports.BAD_REQUEST = 400;
module.exports.UNAUTHORIZED = 401;
module.exports.FORBIDDEN = 403;
module.exports.NOT_FOUND = 404;
module.exports.CONFLICT = 409;
module.exports.ERROR = 500;

module.exports.REGEX_ID = Joi.string().regex(/\d[a-f]/).length(24);

module.exports.REGEX_URL = Joi.string().regex(/(https?:\/\/|ftps?:\/\/|www\.)((?![.,?!;:()]*(\s|$))[^\s]){2,}/);
