const SalaryConfigService = require('../services/salaryConfig.service');
const { successResponse } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const configs = await SalaryConfigService.getAll();
    return successResponse(res, configs, 'Lấy cấu hình lương thành công');
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const history = await SalaryConfigService.getHistory(req.params.role);
    return successResponse(res, history, 'Lấy lịch sử cấu hình lương thành công');
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const config = await SalaryConfigService.create(req.body, req.user._id);
    return successResponse(res, config, 'Tạo cấu hình lương thành công', 201);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getHistory, create };
