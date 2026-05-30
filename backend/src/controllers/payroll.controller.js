const PayrollService = require('../services/payroll.service');
const { successResponse } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const filters = req.query;
    const result = await PayrollService.getPayroll({
      ...filters,
      page: Number(filters.page) || 1,
      limit: Number(filters.limit) || 20
    });
    return successResponse(res, result.payrolls, 'Lấy danh sách bảng lương thành công', 200, result.pagination);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const payroll = await PayrollService.getPayrollById(req.params.id);
    return successResponse(res, payroll, 'Lấy chi tiết bảng lương thành công');
  } catch (err) {
    next(err);
  }
};

const preview = async (req, res, next) => {
  try {
    const { employeeId, month, year } = req.query;
    if (!employeeId || !month || !year) {
      throw Object.assign(new Error('Vui lòng cung cấp employeeId, month, year'), { statusCode: 400 });
    }
    const result = await PayrollService.previewPayroll(employeeId, Number(month), Number(year));
    return successResponse(res, result, 'Lấy bản xem trước lương thành công');
  } catch (err) {
    next(err);
  }
};

const createOrUpdateDraft = async (req, res, next) => {
  try {
    const { employeeId, month, year } = req.body;
    if (!employeeId || !month || !year) {
      throw Object.assign(new Error('Vui lòng cung cấp đầy đủ thông tin'), { statusCode: 400 });
    }
    const payroll = await PayrollService.createOrUpdateDraft(employeeId, Number(month), Number(year), req.user._id);
    return successResponse(res, payroll, 'Tính toán và lưu nháp lương thành công', 201);
  } catch (err) {
    next(err);
  }
};

const createMonthlyPayroll = async (req, res, next) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) {
      throw Object.assign(new Error('Vui lòng cung cấp month và year'), { statusCode: 400 });
    }
    const result = await PayrollService.createMonthlyPayroll(Number(month), Number(year), req.user._id);
    return successResponse(res, result, 'Tính toán lương toàn hệ thống hoàn tất', 201);
  } catch (err) {
    next(err);
  }
};

const confirmPayroll = async (req, res, next) => {
  try {
    const payroll = await PayrollService.confirmPayroll(req.params.id, req.user._id);
    return successResponse(res, payroll, 'Chốt bảng lương thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, preview, createOrUpdateDraft, createMonthlyPayroll, confirmPayroll };
