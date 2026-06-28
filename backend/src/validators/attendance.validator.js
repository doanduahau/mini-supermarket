const { body } = require('express-validator');

const checkInValidator = [
  body('checkInTime')
    .optional()
    .isISO8601().withMessage('Thời gian check-in không hợp lệ (phải là định dạng ISO8601)'),
];

const checkOutValidator = [
  body('checkOutTime')
    .optional()
    .isISO8601().withMessage('Thời gian check-out không hợp lệ (phải là định dạng ISO8601)'),
];

const manualUpdateValidator = [
  body('checkIn')
    .optional()
    .isISO8601().withMessage('Thời gian check-in không hợp lệ'),
  body('checkOut')
    .optional()
    .isISO8601().withMessage('Thời gian check-out không hợp lệ'),
  body('note')
    .notEmpty().withMessage('Cần ghi lý do chỉnh sửa thủ công')
    .isLength({ min: 5 }).withMessage('Cần ghi lý do chỉnh sửa thủ công (tối thiểu 5 ký tự)'),
];

module.exports = { checkInValidator, checkOutValidator, manualUpdateValidator };
