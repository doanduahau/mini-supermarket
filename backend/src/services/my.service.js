const { User, ShiftAssignment, Attendance, Shift, SalaryConfig, Bonus, Payroll } = require('../models');
const ShiftAssignmentService = require('./shiftAssignment.service');
const PayrollService = require('./payroll.service');

const getMySchedule = async (userId, { month, year }) => {
  const m = month ? parseInt(month) : new Date().getMonth() + 1;
  const y = year ? parseInt(year) : new Date().getFullYear();

  const startDate = new Date(Date.UTC(y, m - 1, 1));
  const endDate = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));

  const assignments = await ShiftAssignment.find({
    employee: userId,
    date: { $gte: startDate, $lte: endDate }
  })
    .populate('shift', 'name startTime endTime maxEmployees')
    .sort({ date: 1 });

  const grouped = {};
  assignments.forEach(a => {
    const dStr = a.date.toISOString().split('T')[0];
    if (!grouped[dStr]) grouped[dStr] = [];
    grouped[dStr].push(a);
  });

  const result = Object.keys(grouped).map(d => ({
    date: d,
    assignments: grouped[d]
  }));
  result.sort((a, b) => new Date(a.date) - new Date(b.date));

  return result;
};

const getMyAttendance = async (userId, { month, year, page = 1, limit = 20 }) => {
  const m = month ? parseInt(month) : new Date().getMonth() + 1;
  const y = year ? parseInt(year) : new Date().getFullYear();

  const startDate = new Date(Date.UTC(y, m - 1, 1));
  const endDate = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));

  const query = {
    employee: userId,
    date: { $gte: startDate, $lte: endDate }
  };

  const skip = (page - 1) * limit;

  const allMonthlyAttendances = await Attendance.find(query);
  
  let totalHours = 0;
  let presentDays = 0;
  let absentDays = 0;

  allMonthlyAttendances.forEach(att => {
    if (att.checkIn) {
      presentDays++;
      if (att.actualHours) totalHours += att.actualHours;
    } else {
      absentDays++;
    }
  });

  const summary = {
    totalDays: allMonthlyAttendances.length,
    totalHours: Math.round(totalHours * 100) / 100,
    presentDays,
    absentDays
  };

  const [attendance, total] = await Promise.all([
    Attendance.find(query)
      .populate('shift', 'name startTime endTime')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Attendance.countDocuments(query)
  ]);

  return {
    attendance,
    summary,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
};

const getMyEstimatedSalary = async (userId, { month, year }) => {
  const m = month ? parseInt(month) : new Date().getMonth() + 1;
  const y = year ? parseInt(year) : new Date().getFullYear();

  const existingPayroll = await Payroll.findOne({ employee: userId, month: m, year: y });
  if (existingPayroll) {
    return existingPayroll;
  }

  return PayrollService.previewPayroll(userId, m, y);
};

const updateMyProfile = async (userId, { fullName, phone, avatar }) => {
  const payload = {};
  if (fullName) payload.fullName = fullName;
  if (phone) payload.phone = phone;
  if (avatar) payload.avatar = avatar;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: payload },
    { new: true, runValidators: true }
  ).select('-password -refreshToken');

  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  return user;
};

const selfRegisterShift = async (userId, { shiftId, date }) => {
  return ShiftAssignmentService.create({
    employeeId: userId,
    shiftId,
    date,
    note: 'Nhân viên tự đăng ký'
  }, null);
};

module.exports = {
  getMySchedule,
  getMyAttendance,
  getMyEstimatedSalary,
  updateMyProfile,
  selfRegisterShift
};
