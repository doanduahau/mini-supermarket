const ShiftSwapService = require('../services/shiftSwap.service');
const { successResponse } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const filters = req.query;
    const result = await ShiftSwapService.getAll({
      ...filters,
      userId: req.user._id || req.user.id,
      role: req.user.role,
      page: Number(filters.page) || 1,
      limit: Number(filters.limit) || 20,
    });
    return successResponse(res, result.requests, 'Lấy danh sách đổi ca thành công', 200, result.pagination);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { receiverId, sourceAssignmentId, targetAssignmentId, reason } = req.body;
    if (!receiverId || !sourceAssignmentId || !reason) {
      throw Object.assign(new Error('Vui lòng cung cấp đủ thông tin đổi ca'), { statusCode: 400 });
    }
    const request = await ShiftSwapService.create({
      requesterId: req.user._id || req.user.id,
      receiverId,
      sourceAssignmentId,
      targetAssignmentId,
      reason,
    });
    return successResponse(res, request, 'Tạo yêu cầu đổi ca thành công', 201);
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    if (!status) {
      throw Object.assign(new Error('Vui lòng cung cấp trạng thái'), { statusCode: 400 });
    }
    const request = await ShiftSwapService.updateStatus(req.params.id, status, req.user._id || req.user.id, req.user.role, note);
    return successResponse(res, request, 'Cập nhật trạng thái đổi ca thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, updateStatus };
