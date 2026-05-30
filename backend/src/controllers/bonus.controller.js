const BonusService = require('../services/bonus.service');
const { successResponse } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const filters = req.query;
    const result = await BonusService.getAll({
      ...filters,
      page: Number(filters.page) || 1,
      limit: Number(filters.limit) || 20
    });
    return successResponse(res, result.bonuses, 'Lấy danh sách thưởng/phạt thành công', 200, {
      summary: result.summary,
      ...result.pagination
    });
  } catch (err) {
    next(err);
  }
};

const getByEmployee = async (req, res, next) => {
  try {
    const result = await BonusService.getByEmployee(req.params.id, req.query);
    return successResponse(res, result.bonuses, 'Lấy thông tin thưởng/phạt cá nhân thành công', 200, {
      summary: result.summary
    });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const bonus = await BonusService.create(req.body, req.user._id);
    return successResponse(res, bonus, 'Tạo khoản thưởng/phạt thành công', 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const bonus = await BonusService.update(req.params.id, req.body, req.user._id);
    return successResponse(res, bonus, 'Cập nhật khoản thưởng/phạt thành công');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await BonusService.remove(req.params.id, req.user._id);
    return successResponse(res, null, result.message);
  } catch (err) {
    next(err);
  }
};

const getSummaryByMonth = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) throw Object.assign(new Error('Vui lòng truyền month và year'), { statusCode: 400 });

    const summary = await BonusService.getSummaryByMonth(month, year);
    return successResponse(res, summary, 'Lấy báo cáo tổng hợp thưởng/phạt thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getByEmployee, create, update, remove, getSummaryByMonth };
