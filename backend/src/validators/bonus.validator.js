const { body } = require('express-validator');

const createBonusValidator = [
  body('employeeId')
    .notEmpty().withMessage('Nhân viên là bắt buộc')
    .isMongoId().withMessage('ID nhân viên không hợp lệ'),
  body('month')
    .notEmpty().withMessage('Tháng là bắt buộc')
    .isInt({ min: 1, max: 12 }).withMessage('Tháng phải từ 1 đến 12'),
  body('year')
    .notEmpty().withMessage('Năm là bắt buộc')
    .isInt({ min: 2020 }).withMessage('Năm phải từ 2020 trở đi')
    .custom((value, { req }) => {
      const month = parseInt(req.body.month);
      const year = parseInt(value);
      if (!isNaN(month) && !isNaN(year)) {
        const inputDate = new Date(year, month - 1);
        const now = new Date();
        if (inputDate > now && (inputDate.getFullYear() > now.getFullYear() || inputDate.getMonth() > now.getMonth())) {
          throw new Error('Không thể tạo thưởng/phạt cho tháng tương lai');
        }
      }
      return true;
    }),
  body('amount')
    .notEmpty().withMessage('Số tiền là bắt buộc')
    .isFloat({ min: 1000 }).withMessage('Số tiền tối thiểu 1,000 VNĐ'),
  body('type')
    .notEmpty().withMessage('Loại là bắt buộc')
    .isIn(['bonus', 'penalty']).withMessage('Loại chỉ có thể là bonus hoặc penalty'),
  body('reason')
    .notEmpty().withMessage('Lý do là bắt buộc')
    .isLength({ min: 5, max: 500 }).withMessage('Lý do phải từ 5 đến 500 ký tự')
];

module.exports = { createBonusValidator };
