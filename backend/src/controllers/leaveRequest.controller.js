const LeaveRequestService = require('../services/leaveRequest.service');
const { successResponse } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const filters = req.query;
    // If employee, they can only see their own requests
    if (req.user.role === 'employee') {
      filters.employeeId = req.user._id || req.user.id;
    }
    const result = await LeaveRequestService.getAll({
      ...filters,
      page: Number(filters.page) || 1,
      limit: Number(filters.limit) || 20,
    });
    return successResponse(res, result.requests, 'Lấy danh sách yêu cầu xin nghỉ thành công', 200, result.pagination);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { shiftAssignmentId, reason } = req.body;
    if (!shiftAssignmentId || !reason) {
      throw Object.assign(new Error('Vui lòng chọn ca làm việc và nhập lý do'), { statusCode: 400 });
    }
    const request = await LeaveRequestService.create({
      employeeId: req.user._id || req.user.id,
      shiftAssignmentId,
      reason,
    });
    return successResponse(res, request, 'Tạo yêu cầu xin nghỉ thành công', 201);
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status, managerNote } = req.body;
    if (!status) {
      throw Object.assign(new Error('Vui lòng cung cấp trạng thái'), { statusCode: 400 });
    }
    const request = await LeaveRequestService.updateStatus(req.params.id, status, req.user._id || req.user.id, managerNote);
    return successResponse(res, request, `Yêu cầu xin nghỉ đã được ${status === 'approved' ? 'duyệt' : 'từ chối'}`);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, updateStatus };
