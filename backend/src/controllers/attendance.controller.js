const AttendanceService = require('../services/attendance.service');
const { successResponse } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const filters = req.query;
    const result = await AttendanceService.getAll({
      ...filters,
      page: Number(filters.page) || 1,
      limit: Number(filters.limit) || 20
    });
    return successResponse(res, result.attendances, 'Attendances fetched successfully', 200, result.pagination);
  } catch (err) {
    next(err);
  }
};

const getDailyReport = async (req, res, next) => {
  try {
    const { date, shiftId } = req.query;
    if (!date) throw Object.assign(new Error('Vui lòng cung cấp ngày báo cáo'), { statusCode: 400 });
    
    const report = await AttendanceService.getDailyReport({ date, shiftId });
    return successResponse(res, report, 'Lấy báo cáo chấm công thành công');
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const attendance = await AttendanceService.getById(req.params.id);
    return successResponse(res, attendance, 'Attendance fetched successfully');
  } catch (err) {
    next(err);
  }
};

const checkIn = async (req, res, next) => {
  try {
    const { checkInTime } = req.body;
    const attendance = await AttendanceService.checkIn(req.params.id, checkInTime, req.user._id);
    return successResponse(res, attendance, 'Check-in thành công');
  } catch (err) {
    next(err);
  }
};

const checkOut = async (req, res, next) => {
  try {
    const { checkOutTime } = req.body;
    const attendance = await AttendanceService.checkOut(req.params.id, checkOutTime, req.user._id);
    return successResponse(res, attendance, 'Check-out thành công');
  } catch (err) {
    next(err);
  }
};

const manualUpdate = async (req, res, next) => {
  try {
    const attendance = await AttendanceService.manualUpdate(req.params.id, req.body, req.user._id);
    return successResponse(res, attendance, 'Cập nhật chấm công thủ công thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getDailyReport, getById, checkIn, checkOut, manualUpdate };
