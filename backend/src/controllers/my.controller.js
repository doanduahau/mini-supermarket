const MyService = require('../services/my.service');
const { successResponse } = require('../utils/response');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

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

const getShiftAvailability = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      throw Object.assign(new Error('Vui lòng cung cấp startDate và endDate'), { statusCode: 400 });
    }
    const availability = await MyService.getShiftAvailability(startDate, endDate, req.user._id);
    return successResponse(res, availability, 'Lấy thông tin ca trống thành công');
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

const selfCheckIn = async (req, res, next) => {
  try {
    const attendance = await MyService.selfCheckIn(req.params.id, req.user._id);
    return successResponse(res, attendance, 'Chấm công vào ca thành công');
  } catch (err) {
    next(err);
  }
};

const selfCheckOut = async (req, res, next) => {
  try {
    const attendance = await MyService.selfCheckOut(req.params.id, req.user._id);
    return successResponse(res, attendance, 'Chấm công ra ca thành công');
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

const selfRegisterBulk = async (req, res, next) => {
  try {
    const { assignments } = req.body;
    if (!Array.isArray(assignments)) throw Object.assign(new Error('Dữ liệu không hợp lệ'), { statusCode: 400 });
    
    const results = await MyService.selfRegisterBulk(req.user._id, assignments);
    return successResponse(res, results, 'Đăng ký ca làm việc thành công', 201);
  } catch (err) {
    next(err);
  }
};

const cancelSelfRegister = async (req, res, next) => {
  try {
    await MyService.cancelMyShift(req.user._id, req.params.id);
    return successResponse(res, null, 'Hủy đăng ký ca thành công');
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw Object.assign(new Error('Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới'), { statusCode: 400 });
    }
    if (newPassword.length < 6) {
      throw Object.assign(new Error('Mật khẩu mới phải có ít nhất 6 ký tự'), { statusCode: 400 });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw Object.assign(new Error('Mật khẩu hiện tại không đúng'), { statusCode: 400 });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return successResponse(res, null, 'Đổi mật khẩu thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getSchedule,
  getShiftAvailability,
  getAttendance,
  selfCheckIn,
  selfCheckOut,
  getEstimatedSalary,
  selfRegister,
  selfRegisterBulk,
  cancelSelfRegister
};
