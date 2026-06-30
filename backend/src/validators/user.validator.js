const { body } = require('express-validator');
const { User } = require('../models');

const createUserValidator = [
  body('fullName')
    .notEmpty()
    .withMessage('Họ tên là bắt buộc')
    .isLength({ min: 2, max: 50 })
    .withMessage('Họ tên phải từ 2 đến 50 ký tự'),
  body('email')
    .notEmpty()
    .withMessage('Email là bắt buộc')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .custom(async (value) => {
      const existingUser = await User.findOne({ where: { email: value.toLowerCase() } });
      if (existingUser) {
        return Promise.reject('Email đã tồn tại trong hệ thống');
      }
    }),
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu là bắt buộc')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu tối thiểu 6 ký tự')
    .matches(/^(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu cần có ít nhất 1 chữ hoa và 1 số'),
  body('role')
    .optional()
    .isIn(['supermarket_owner', 'shift_manager', 'employee'])
    .withMessage('Quyền không hợp lệ'),
  body('phone')
    .optional()
    .matches(/^(0[3|5|7|8|9])+([0-9]{8})$/)
    .withMessage('Số điện thoại không hợp lệ'),
  body('bankAccount')
    .optional()
    .isString(),
  body('bankName')
    .optional()
    .isString(),
];

const updateUserValidator = [
  body('fullName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Họ tên phải từ 2 đến 50 ký tự'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email không hợp lệ'),
  body('phone')
    .optional()
    .matches(/^(0[3|5|7|8|9])+([0-9]{8})$/)
    .withMessage('Số điện thoại không hợp lệ'),
  body('bankAccount')
    .optional()
    .isString(),
  body('bankName')
    .optional()
    .isString(),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar phải là một đường dẫn URL hợp lệ'),
];

module.exports = { createUserValidator, updateUserValidator };
