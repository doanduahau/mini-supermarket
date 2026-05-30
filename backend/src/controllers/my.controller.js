const MyService = require('../services/my.service');
const { successResponse } = require('../utils/response');

const getProfile = async (req, res, next) => {
  try {
    return successResponse(res, req.user, 'Lấy thông tin cá nhân thành công');
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await MyService.updateMyProfile(req.user._id, req.body);
    return successResponse(res, user, 'Cập nhật thông tin thành công');
  } catch (err) {
    next(err);
  }
};

const getSchedule = async (req, res, next) => {
  try {
    const schedule = await MyService.getMySchedule(req.user._id, req.query);
    return successResponse(res, schedule, 'Lấy lịch làm việc thành công');
  } catch (err) {
    next(err);
  }
};

const getAttendance = async (req, res, next) => {
  try {
    const { month, year, page, limit } = req.query;
    const result = await MyService.getMyAttendance(req.user._id, {
      month, year,
      page: Number(page) || 1,
      limit: Number(limit) || 20
    });
    return successResponse(
      res, 
      { attendance: result.attendance, summary: result.summary }, 
      'Lấy lịch sử chấm công thành công', 
      200, 
      result.pagination
    );
  } catch (err) {
    next(err);
  }
};

const getEstimatedSalary = async (req, res, next) => {
  try {
    const salaryData = await MyService.getMyEstimatedSalary(req.user._id, req.query);
    return successResponse(res, salaryData, 'Lấy dự toán lương thành công');
  } catch (err) {
    next(err);
  }
};

const selfRegister = async (req, res, next) => {
  try {
    const assignment = await MyService.selfRegisterShift(req.user._id, req.body);
    return successResponse(res, assignment, 'Đăng ký ca làm việc thành công', 201);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getSchedule,
  getAttendance,
  getEstimatedSalary,
  selfRegister
};
