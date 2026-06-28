const { query } = require('express-validator');

const monthYearValidator = [
  query('month')
    .notEmpty().withMessage('Tháng là bắt buộc')
    .isInt({ min: 1, max: 12 }).withMessage('Tháng phải từ 1 đến 12'),
  query('year')
    .notEmpty().withMessage('Năm là bắt buộc')
    .isInt({ min: 2020, max: 2030 }).withMessage('Năm phải từ 2020 đến 2030')
];

module.exports = { monthYearValidator };
