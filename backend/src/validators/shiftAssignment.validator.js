const { body } = require('express-validator');

const createAssignmentValidator = [
  body('employeeId')
    .notEmpty().withMessage('Nhân viên là bắt buộc')
    .isMongoId().withMessage('ID nhân viên không hợp lệ'),
  body('shiftId')
    .notEmpty().withMessage('Ca làm việc là bắt buộc')
    .isMongoId().withMessage('ID ca làm việc không hợp lệ'),
  body('date')
    .notEmpty().withMessage('Ngày làm việc là bắt buộc')
    .isISO8601().withMessage('Ngày không hợp lệ (định dạng YYYY-MM-DD)'),
  body('note')
    .optional()
    .isLength({ max: 200 }).withMessage('Ghi chú không được vượt quá 200 ký tự'),
];

module.exports = { createAssignmentValidator };
