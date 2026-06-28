const { body } = require('express-validator');

const loginValidator = [
  body('email')
    .notEmpty()
    .withMessage('Email là bắt buộc')
    .isEmail()
    .withMessage('Email không hợp lệ'),
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu là bắt buộc')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu tối thiểu 6 ký tự'),
];

module.exports = { loginValidator };
