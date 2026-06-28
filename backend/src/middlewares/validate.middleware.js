const { validationResult } = require('express-validator');

/**
 * Middleware để thực thi mảng validation.
 * Nếu có lỗi, trả về HTTP 422 và danh sách các lỗi.
 *
 * @param {Array} validations - Mảng các rule từ express-validator
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Chạy tất cả các validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Lấy kết quả lỗi
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next(); // Không có lỗi -> Đi tiếp
    }

    // Format danh sách lỗi
    const extractedErrors = [];
    errors.array().forEach((err) => {
      extractedErrors.push({ field: err.path || err.param, message: err.msg });
    });

    // Trả về JSON theo đúng yêu cầu
    return res.status(422).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: extractedErrors,
    });
  };
};

module.exports = { validate };
