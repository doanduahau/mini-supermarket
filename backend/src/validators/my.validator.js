const { body } = require('express-validator');

const updateProfileValidator = [
  body('fullName')
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('Họ tên phải từ 2 đến 50 ký tự'),
  body('phone')
    .optional()
    .matches(/^(0[3|5|7|8|9])+([0-9]{8})$/).withMessage('Số điện thoại không hợp lệ'),
  body('avatar')
    .optional()
    .isURL().withMessage('Avatar phải là đường dẫn URL hợp lệ'),
];

const selfRegisterValidator = [
  body('shiftId')
    .notEmpty().withMessage('Ca làm việc là bắt buộc')
    .isMongoId().withMessage('Ca làm việc không hợp lệ'),
  body('date')
    .notEmpty().withMessage('Ngày là bắt buộc')
    .isISO8601().withMessage('Ngày không hợp lệ (định dạng YYYY-MM-DD)')
    .custom(value => {
      const inputDate = new Date(value);
      inputDate.setUTCHours(0, 0, 0, 0);
      
      const tomorrow = new Date();
      tomorrow.setUTCHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (inputDate < tomorrow) {
        throw new Error('Chỉ được đăng ký ca từ ngày mai trở đi');
      }
      return true;
    }),
];

module.exports = { updateProfileValidator, selfRegisterValidator };
