const { User, ShiftAssignment, Attendance, Shift, SalaryConfig, Bonus, Payroll } = require('../models');
const ShiftAssignmentService = require('./shiftAssignment.service');
const PayrollService = require('./payroll.service');
const AttendanceService = require('./attendance.service');

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

const getShiftAvailability = async (startDate, endDate, userId) => {
  const shifts = await Shift.find({}).sort({ startTime: 1 });
  
  const start = new Date(startDate);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setUTCHours(23, 59, 59, 999);

  const assignments = await ShiftAssignment.find({
    date: { $gte: start, $lte: end },
    status: { $in: ['pending', 'approved'] }
  });

  const dates = [];
  let curr = new Date(start);
  
  while (curr <= end) {
    const dStr = curr.toISOString().split('T')[0];
    const dayData = {
      date: dStr,
      shifts: shifts.map(s => {
        const registeredAssignments = assignments.filter(a => 
          a.date.toISOString().split('T')[0] === dStr && 
          a.shift.toString() === s._id.toString()
        );
        
        const isRegisteredByMe = registeredAssignments.some(a => a.employee.toString() === userId.toString());
        
        return {
          _id: s._id,
          name: s.name,
          startTime: s.startTime,
          endTime: s.endTime,
          maxEmployees: s.maxEmployees,
          registeredCount: registeredAssignments.length,
          availableCount: Math.max(0, s.maxEmployees - registeredAssignments.length),
          isRegisteredByMe
        };
      })
    };
    dates.push(dayData);
    curr.setDate(curr.getDate() + 1);
  }

  return dates;
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

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  allMonthlyAttendances.forEach(att => {
    if (att.checkIn) {
      presentDays++;
      if (att.actualHours) totalHours += att.actualHours;
    } else {
      const attDate = new Date(att.date);
      attDate.setUTCHours(0, 0, 0, 0);
      if (attDate.getTime() < today.getTime()) {
        absentDays++;
      }
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
      .sort({ date: 1, 'shift.startTime': 1 })
      .skip(skip)
      .limit(limit),
    Attendance.countDocuments(query)
  ]);

  await AttendanceService.processAutoCheckOut(attendance);

  return {
    attendance,
    summary,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
};

const selfCheckIn = async (attendanceId, userId) => {
  const attendance = await Attendance.findById(attendanceId);
  if (!attendance) throw Object.assign(new Error('Không tìm thấy ca trực'), { statusCode: 404 });
  if (attendance.employee.toString() !== userId.toString()) throw Object.assign(new Error('Không có quyền chấm công ca này'), { statusCode: 403 });
  
  return AttendanceService.checkIn(attendanceId, new Date(), userId);
};

const selfCheckOut = async (attendanceId, userId) => {
  const attendance = await Attendance.findById(attendanceId);
  if (!attendance) throw Object.assign(new Error('Không tìm thấy ca trực'), { statusCode: 404 });
  if (attendance.employee.toString() !== userId.toString()) throw Object.assign(new Error('Không có quyền chấm công ca này'), { statusCode: 403 });

  return AttendanceService.checkOut(attendanceId, new Date(), userId);
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

const updateMyProfile = async (userId, { fullName, phone, avatar, email, bankAccount, bankName }) => {
  const payload = {};
  if (fullName !== undefined) payload.fullName = fullName;
  if (phone !== undefined) payload.phone = phone;
  if (avatar !== undefined) payload.avatar = avatar;
  if (email !== undefined) payload.email = email;
  if (bankAccount !== undefined) payload.bankAccount = bankAccount;
  if (bankName !== undefined) payload.bankName = bankName;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: payload },
    { new: true, runValidators: true }
  ).select('-password -refreshToken');

  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  return user;
};

const selfRegisterShift = async (userId, { shiftId, date }) => {
  return ShiftAssignmentService.selfRegister({ shiftId, date }, userId);
};

const selfRegisterBulk = async (userId, assignments) => {
  const results = [];
  const errors = [];
  for (const { shiftId, date } of assignments) {
    try {
      const result = await ShiftAssignmentService.selfRegister({ shiftId, date }, userId);
      results.push(result);
    } catch (err) {
      errors.push({ shiftId, date, reason: err.message });
    }
  }
  if (results.length === 0 && errors.length > 0) {
    throw Object.assign(new Error('Không thể đăng ký các ca đã chọn: ' + errors.map(e => e.reason).join(', ')), { statusCode: 400 });
  }
  return { results, errors };
};

const cancelMyShift = async (userId, assignmentId) => {
  const assignment = await ShiftAssignment.findById(assignmentId);
  if (!assignment) throw Object.assign(new Error('Không tìm thấy ca đăng ký'), { statusCode: 404 });
  if (assignment.employee.toString() !== userId.toString()) {
    throw Object.assign(new Error('Không có quyền hủy ca này'), { statusCode: 403 });
  }
  if (assignment.status !== 'pending') {
    throw Object.assign(new Error('Chỉ có thể hủy ca đang chờ duyệt'), { statusCode: 400 });
  }
  await ShiftAssignment.findByIdAndDelete(assignmentId);
  return true;
};

module.exports = {
  getMySchedule,
  getShiftAvailability,
  getMyAttendance,
  selfCheckIn,
  selfCheckOut,
  getMyEstimatedSalary,
  updateMyProfile,
  selfRegisterShift,
  selfRegisterBulk,
  cancelMyShift
};
