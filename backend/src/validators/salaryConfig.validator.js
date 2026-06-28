const { body } = require('express-validator');

const createConfigValidator = [
  body('role')
    .notEmpty().withMessage('Quyền (role) là bắt buộc')
    .isIn(['supermarket_owner', 'shift_manager', 'employee']).withMessage('Quyền không hợp lệ'),
  body('hourlyRate')
    .notEmpty().withMessage('Đơn giá lương là bắt buộc')
    .isFloat({ min: 1000 }).withMessage('Đơn giá tối thiểu 1,000 VNĐ/giờ'),
  body('effectiveFrom')
    .optional()
    .isISO8601().withMessage('Ngày hiệu lực không hợp lệ (phải là YYYY-MM-DD)')
    .custom(value => {
      if (value) {
        const inputDate = new Date(value);
        inputDate.setUTCHours(0, 0, 0, 0);
        
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        
        if (inputDate < today) {
          throw new Error('Ngày hiệu lực không được là ngày trong quá khứ');
        }
      }
      return true;
    })
];

module.exports = { createConfigValidator };
