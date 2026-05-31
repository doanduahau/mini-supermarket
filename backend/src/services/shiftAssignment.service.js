const { ShiftAssignment, Shift, User, Attendance } = require('../models');
const { sendMail } = require('../utils/mailer');
const templates = require('../utils/emailTemplates');
const { sendNotificationToUser } = require('../socket/socket.handler');

const getAll = async ({ date, employeeId, shiftId, status, month, year, page = 1, limit = 20 }) => {
  const query = {};

  if (date) {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    const endD = new Date(d);
    endD.setUTCHours(23, 59, 59, 999);
    query.date = { $gte: d, $lte: endD };
  } else if (month && year) {
    const m = parseInt(month);
    const y = parseInt(year);
    const startDate = new Date(Date.UTC(y, m - 1, 1));
    const endDate = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
    query.date = { $gte: startDate, $lte: endDate };
  }

  if (employeeId) query.employee = employeeId;
  if (shiftId) query.shift = shiftId;
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [assignments, total] = await Promise.all([
    ShiftAssignment.find(query)
      .populate('employee', 'fullName email role avatar status')
      .populate('shift', 'name startTime endTime')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit),
    ShiftAssignment.countDocuments(query),
  ]);

  return {
    assignments,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
};

const create = async ({ employeeId, shiftId, date, note }, assignedBy) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(d);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const shift = await Shift.findById(shiftId);
  if (!shift) throw Object.assign(new Error('Ca làm việc không tồn tại'), { statusCode: 404 });

  const user = await User.findById(employeeId);
  if (!user || user.status === 'locked') {
    throw Object.assign(new Error('Nhân viên không tồn tại hoặc đã bị khóa'), { statusCode: 400 });
  }

  const existingInShift = await ShiftAssignment.countDocuments({
    shift: shiftId,
    date: { $gte: d, $lte: endOfDay },
    status: { $in: ['pending', 'approved'] }
  });

  if (existingInShift >= shift.maxEmployees) {
    throw Object.assign(new Error(`Ca ${shift.name} ngày này đã đủ ${shift.maxEmployees} nhân viên`), { statusCode: 400 });
  }

  const existingDate = await ShiftAssignment.findOne({
    employee: employeeId,
    date: { $gte: d, $lte: endOfDay },
    status: { $in: ['pending', 'approved'] }
  });

  if (existingDate) {
    throw Object.assign(new Error('Nhân viên đã có ca làm việc trong ngày này'), { statusCode: 400 });
  }

  const assignment = await ShiftAssignment.create({
    employee: employeeId,
    shift: shiftId,
    date: d,
    status: assignedBy ? 'approved' : 'pending',
    assignedBy,
    note
  });

  // If approved upon creation, also spawn an empty Attendance
  if (assignedBy) {
    await Attendance.create({
      employee: employeeId,
      shift: shiftId,
      date: d,
      recordedBy: assignedBy
    });
  }

  return ShiftAssignment.findById(assignment._id)
    .populate('employee', 'fullName email role avatar status')
    .populate('shift', 'name startTime endTime');
};

const updateStatus = async (id, status, actorId) => {
  if (!['approved', 'rejected'].includes(status)) {
    throw Object.assign(new Error("Trạng thái chỉ có thể là 'approved' hoặc 'rejected'"), { statusCode: 400 });
  }

  const assignment = await ShiftAssignment.findById(id).populate('shift');
  if (!assignment) throw Object.assign(new Error('Không tìm thấy lịch phân công'), { statusCode: 404 });

  if (status === 'approved' && assignment.status !== 'approved') {
    const d = new Date(assignment.date);
    d.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(d);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingInShift = await ShiftAssignment.countDocuments({
      shift: assignment.shift._id,
      date: { $gte: d, $lte: endOfDay },
      status: 'approved'
    });

    if (existingInShift >= assignment.shift.maxEmployees) {
      throw Object.assign(new Error(`Ca ${assignment.shift.name} ngày này đã đủ ${assignment.shift.maxEmployees} nhân viên`), { statusCode: 400 });
    }

    await Attendance.create({
      employee: assignment.employee,
      shift: assignment.shift._id,
      date: assignment.date,
      recordedBy: actorId
    });
  }

  assignment.status = status;
  await assignment.save();

  const populatedAssignment = await ShiftAssignment.findById(assignment._id)
    .populate('employee', 'fullName email role avatar status')
    .populate('shift', 'name startTime endTime');

  if (status === 'approved') {
    const mailOptions = templates.shiftApproved({
      employeeName: populatedAssignment.employee.fullName,
      shiftName: populatedAssignment.shift.name,
      date: populatedAssignment.date,
      startTime: populatedAssignment.shift.startTime,
      endTime: populatedAssignment.shift.endTime
    });
    await sendMail({ to: populatedAssignment.employee.email, ...mailOptions });
  } else if (status === 'rejected') {
    const mailOptions = templates.shiftRejected({
      employeeName: populatedAssignment.employee.fullName,
      shiftName: populatedAssignment.shift.name,
      date: populatedAssignment.date,
      reason: 'Quản lý từ chối duyệt ca'
    });
    await sendMail({ to: populatedAssignment.employee.email, ...mailOptions });
  }

  sendNotificationToUser(
    populatedAssignment.employee._id,
    status === 'approved' ? 'notification:shift_approved' : 'notification:shift_rejected',
    {
      assignmentId: populatedAssignment._id,
      shiftName: populatedAssignment.shift.name,
      date: populatedAssignment.date,
      startTime: populatedAssignment.shift.startTime,
      endTime: populatedAssignment.shift.endTime,
      message: status === 'approved' 
        ? `Ca ${populatedAssignment.shift.name} ngày ${new Date(populatedAssignment.date).toLocaleDateString('vi-VN')} đã được duyệt` 
        : `Ca ${populatedAssignment.shift.name} ngày ${new Date(populatedAssignment.date).toLocaleDateString('vi-VN')} bị từ chối`
    }
  );

  return populatedAssignment;
};

const selfRegister = async ({ shiftId, date }, employeeId) => {
  const registerDate = new Date(date);
  registerDate.setUTCHours(0,0,0,0);
  
  const tomorrow = new Date();
  tomorrow.setUTCHours(0,0,0,0);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (registerDate < tomorrow) {
    throw Object.assign(new Error('Chỉ được đăng ký ca làm việc từ ngày mai trở đi'), { statusCode: 400 });
  }

  return create({ employeeId, shiftId, date, note: 'Nhân viên tự đăng ký' }, null);
};

const remove = async (id) => {
  const assignment = await ShiftAssignment.findById(id);
  if (!assignment) throw Object.assign(new Error('Không tìm thấy lịch phân công'), { statusCode: 404 });

  const today = new Date();
  today.setUTCHours(0,0,0,0);

  if (assignment.status === 'approved' && assignment.date < today) {
    throw Object.assign(new Error('Không thể xóa phân công đã thực hiện trong quá khứ'), { statusCode: 400 });
  }

  const attendance = await Attendance.findOne({
    employee: assignment.employee,
    shift: assignment.shift,
    date: assignment.date
  });

  if (attendance) {
    if (attendance.checkIn) {
      throw Object.assign(new Error('Không thể xóa phân công vì nhân viên đã check-in'), { statusCode: 400 });
    }
    await Attendance.findByIdAndDelete(attendance._id);
  }

  await ShiftAssignment.findByIdAndDelete(id);
  return true;
};

module.exports = { getAll, create, updateStatus, selfRegister, remove };
